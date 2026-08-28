import { db } from '../../firebase';
import { callWorkerQueued } from '../../web-worker';

const types = {
  SET_LOADING: 'CAREER/SET_LOADING',
  SET_CAREER_PROFILE: 'CAREER/SET_CAREER_PROFILE',
  SET_CAREER_SECTIONS: 'CAREER/SET_CAREER_SECTIONS',
  CLEAR_CAREER: 'CAREER/CLEAR_CAREER',
};

const state = {
  loading: false,
  playerName: '',
  photo: '',
  sections: [],
};

const getters = {
  careerLoading: state => state.loading,
  careerPlayerName: state => state.playerName,
  careerPhoto: state => state.photo,
  careerSections: state => state.sections,
};

const SPORT_ORDER = ['softball', 'baseball'];
const SPORT_LABEL = { softball: '壘球', baseball: '棒球' };
const STAT_KEYS = [
  'PA',
  'AB',
  'H',
  '2H',
  '3H',
  'HR',
  'R',
  'RBI',
  'K',
  'DP',
  'BB',
  'SF',
  'AVG',
  'OBP',
  'SLG',
  'OPS',
];
const ADVANCED_KEYS = [
  'LEVEL',
  'AVG_NO',
  'AVG_DESC_NO',
  'AVG_SP',
  'AVG_DESC_SP',
  'AVG_FB',
  'AVG_DESC_FB',
];

// Run-scoring is annotated on a teammate's at-bat entry (`r` / `onbase[].name`
// + result:'run'), not on the scoring player's own record. So instead of
// filtering orders down to just this player, keep every record for the team
// and only rename this player's occurrences (as batter, or as the runner
// referenced on someone else's entry) to their uid.
const renameInTeamRecords = (orders, nameInTeam, uid, table) =>
  orders.map(item => ({
    ...item,
    name: item.name === nameInTeam ? uid : item.name,
    r: item.r === nameInTeam ? uid : item.r,
    onbase: Array.isArray(item.onbase)
      ? item.onbase.map(ob =>
          ob && ob.name === nameInTeam ? { ...ob, name: uid } : ob,
        )
      : item.onbase,
    _table: table,
  }));

// 一次 postMessage 算完所有區間（每個年度 + 總計），而不是每個年度各自呼叫一次
// worker——後者會把同一份 records（可能是整支球隊的生涯紀錄）重複序列化、重複掃描 N 次。
const genStatsBatch = (uid, records, periods) =>
  callWorkerQueued({
    cmd: 'GenStatisticsBatch',
    players: [{ id: uid, data: {} }],
    records,
    unlimitedPA: true,
    top: 999999,
    sortBy: 'PA',
    periods,
  }).then(
    results => new Map(results.map(({ key, result }) => [key, result[0]])),
  );

const pickCols = stat => {
  const cols = STAT_KEYS.reduce((acc, key) => {
    const value = stat ? stat[key] : undefined;
    acc[key] = value === undefined || value === '-' ? 0 : value;
    return acc;
  }, {});
  ADVANCED_KEYS.forEach(key => {
    cols[key] = stat && stat[key] !== undefined ? stat[key] : '-';
  });
  cols.locations = stat && Array.isArray(stat.locations) ? stat.locations : [];
  return cols;
};

const yearOf = table => table.split('::')[1].slice(0, 4);

// `queryGameIds` scopes the worker's cross-player run-crediting lookup and
// should be every allowed game the team played, not just the ones this
// player personally batted in — otherwise a run credited to this player via
// another batter's record in a game they have no plate appearance in (e.g. a
// pinch-run-only appearance) gets silently dropped. `playerGameIds` is only
// used to decide which years to show and to compute "G" (games played).
const TOTAL_KEY = '__total__';

const buildTeamStats = async (
  playerId,
  records,
  queryGameIds,
  playerGameIds,
  unlockGamesPrefixed,
) => {
  const years = [...new Set(playerGameIds.map(yearOf))].sort();
  const periods = years.map(year => ({
    key: year,
    games: queryGameIds.filter(id => yearOf(id) === year),
  }));
  periods.push({ key: TOTAL_KEY, games: queryGameIds });

  const statsByKey = await genStatsBatch(playerId, records, periods);

  const rows = years.map(year => {
    const yearPlayerGameIds = playerGameIds.filter(id => yearOf(id) === year);
    return {
      year,
      G: yearPlayerGameIds.length,
      ...pickCols(statsByKey.get(year)),
      unlocked: yearPlayerGameIds.some(id => unlockGamesPrefixed.includes(id)),
    };
  });
  const total = {
    G: playerGameIds.length,
    ...pickCols(statsByKey.get(TOTAL_KEY)),
    unlocked: playerGameIds.some(id => unlockGamesPrefixed.includes(id)),
  };
  return { rows, total };
};

const actions = {
  clearCareer({ commit }) {
    commit(types.CLEAR_CAREER);
  },
  async fetchCareerStats({ commit }, uid) {
    commit(types.SET_LOADING, true);
    commit(types.CLEAR_CAREER);

    const accountDoc = await db
      .collection('accounts')
      .doc(uid)
      .get();
    const account = accountDoc.data() || {};
    const teamCodes = account.teams || [];

    // 帳號資料一拿到就先顯示名字/頭像，不用等全部球隊的比賽紀錄都讀完
    commit(types.SET_CAREER_PROFILE, {
      playerName: account.name || '',
      photo: account.photo || '',
    });

    const fetchTeamData = async teamCode => {
      const teamDoc = await db
        .collection('teams')
        .doc(teamCode)
        .get();
      if (!teamDoc.exists) return null;
      const {
        players = {},
        unlockGames = [],
        teamType = 'softball',
        name: teamName,
      } = teamDoc.data();
      const nameInTeam = Object.keys(players).find(
        name => players[name].uid === uid,
      );
      if (!nameInTeam) return null;

      const gameCollection = await db
        .collection(`teams/${teamCode}/games`)
        .get();
      const validDocs = gameCollection.docs.filter(doc =>
        Array.isArray(doc.data().orders),
      );
      const records = validDocs.flatMap(doc =>
        renameInTeamRecords(
          doc.data().orders,
          nameInTeam,
          uid,
          `${teamCode}::${doc.id}`,
        ),
      );
      const queryGameIds = validDocs.map(doc => `${teamCode}::${doc.id}`);
      const playerGameIds = [
        ...new Set(records.filter(r => r.name === uid).map(r => r._table)),
      ];
      if (!playerGameIds.length) return null;

      const unlockGamesPrefixed = unlockGames.map(id => `${teamCode}::${id}`);
      const { rows, total } = await buildTeamStats(
        uid,
        records,
        queryGameIds,
        playerGameIds,
        unlockGamesPrefixed,
      );

      return {
        teamCode,
        teamName: teamName || teamCode,
        teamType,
        records,
        queryGameIds,
        playerGameIds,
        unlockGamesPrefixed,
        rows,
        total,
        firstYear: rows.length ? rows[0].year : '9999',
      };
    };

    const teamsWithData = (
      await Promise.all(teamCodes.map(fetchTeamData))
    ).filter(Boolean);

    const totalTeamCount = teamsWithData.length;
    const distinctSports = [...new Set(teamsWithData.map(t => t.teamType))];
    const sections = [];

    if (totalTeamCount === 1) {
      const t = teamsWithData[0];
      sections.push({
        key: t.teamCode,
        title: '生涯',
        teamType: t.teamType,
        isAggregate: false,
        hideHeader: true,
        rows: t.rows,
        total: t.total,
      });
    } else if (totalTeamCount > 1) {
      for (const sport of SPORT_ORDER) {
        const teamsOfSport = teamsWithData
          .filter(t => t.teamType === sport)
          .sort((a, b) => a.firstYear.localeCompare(b.firstYear));
        if (!teamsOfSport.length) continue;

        teamsOfSport.forEach(t => {
          sections.push({
            key: t.teamCode,
            title: t.teamName,
            teamType: sport,
            isAggregate: false,
            rows: t.rows,
            total: t.total,
          });
        });

        if (teamsOfSport.length > 1) {
          const combinedRecords = teamsOfSport.flatMap(t => t.records);
          const combinedQueryGameIds = teamsOfSport.flatMap(
            t => t.queryGameIds,
          );
          const combinedPlayerGameIds = teamsOfSport.flatMap(
            t => t.playerGameIds,
          );
          const combinedUnlockGamesPrefixed = teamsOfSport.flatMap(
            t => t.unlockGamesPrefixed,
          );
          const { rows, total } = await buildTeamStats(
            uid,
            combinedRecords,
            combinedQueryGameIds,
            combinedPlayerGameIds,
            combinedUnlockGamesPrefixed,
          );
          sections.push({
            key: `aggregate-${sport}`,
            title:
              distinctSports.length === 1
                ? '生涯'
                : `${SPORT_LABEL[sport]}生涯`,
            teamType: sport,
            isAggregate: true,
            rows,
            total,
          });
        }
      }
    }

    commit(types.SET_CAREER_SECTIONS, { sections });
    commit(types.SET_LOADING, false);
  },
  // For a player with no account (no uid) — their identity only exists
  // within this one team's roster, so there's no cross-team lookup to do:
  // query this team directly by its roster-local name.
  async fetchTeamCareerStats({ commit }, { teamCode, playerName }) {
    commit(types.SET_LOADING, true);
    commit(types.CLEAR_CAREER);
    // 名字是從路由參數來的，不用等任何非同步請求就能先顯示
    commit(types.SET_CAREER_PROFILE, { playerName, photo: '' });

    const teamDoc = await db
      .collection('teams')
      .doc(teamCode)
      .get();
    const {
      players = {},
      unlockGames = [],
      teamType = 'softball',
    } = teamDoc.exists ? teamDoc.data() : {};

    if (!teamDoc.exists || !players[playerName]) {
      commit(types.SET_CAREER_SECTIONS, { sections: [] });
      commit(types.SET_LOADING, false);
      return;
    }

    const gameCollection = await db.collection(`teams/${teamCode}/games`).get();
    const validDocs = gameCollection.docs.filter(doc =>
      Array.isArray(doc.data().orders),
    );
    const records = validDocs.flatMap(doc =>
      doc.data().orders.map(item => ({
        ...item,
        _table: `${teamCode}::${doc.id}`,
      })),
    );
    const queryGameIds = validDocs.map(doc => `${teamCode}::${doc.id}`);
    const playerGameIds = [
      ...new Set(records.filter(r => r.name === playerName).map(r => r._table)),
    ];

    const unlockGamesPrefixed = unlockGames.map(id => `${teamCode}::${id}`);
    const sections = [];
    if (playerGameIds.length) {
      const { rows, total } = await buildTeamStats(
        playerName,
        records,
        queryGameIds,
        playerGameIds,
        unlockGamesPrefixed,
      );
      sections.push({
        key: teamCode,
        title: '生涯',
        teamType,
        isAggregate: false,
        hideHeader: true,
        rows,
        total,
      });
    }

    commit(types.SET_CAREER_SECTIONS, { sections });
    commit(types.SET_LOADING, false);
  },
};

const mutations = {
  [types.SET_LOADING](state, value) {
    state.loading = value;
  },
  [types.SET_CAREER_PROFILE](state, { playerName, photo }) {
    state.playerName = playerName;
    state.photo = photo;
  },
  [types.SET_CAREER_SECTIONS](state, { sections }) {
    state.sections = sections;
  },
  [types.CLEAR_CAREER](state) {
    state.playerName = '';
    state.photo = '';
    state.sections = [];
  },
};

export { types };
export default {
  state,
  getters,
  actions,
  mutations,
};
