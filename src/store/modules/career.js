import { db } from '../../firebase';
import { callWorkerQueued } from '../../web-worker';

const types = {
  SET_LOADING: 'CAREER/SET_LOADING',
  SET_CAREER: 'CAREER/SET_CAREER',
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

const genStats = (uid, records, games) =>
  callWorkerQueued({
    cmd: 'GenStatistics',
    players: [{ id: uid, data: {} }],
    records,
    unlimitedPA: true,
    top: 999999,
    period: [{ period: 'career', select: true, games }],
    sortBy: 'PA',
    excludedGames: [],
  }).then(result => result[0]);

const pickCols = stat => {
  const cols = STAT_KEYS.reduce((acc, key) => {
    const value = stat ? stat[key] : undefined;
    acc[key] = value === undefined || value === '-' ? 0 : value;
    return acc;
  }, {});
  ADVANCED_KEYS.forEach(key => {
    cols[key] = stat && stat[key] !== undefined ? stat[key] : '-';
  });
  return cols;
};

const yearOf = table => table.split('::')[1].slice(0, 4);

// `queryGameIds` scopes the worker's cross-player run-crediting lookup and
// should be every allowed game the team played, not just the ones this
// player personally batted in — otherwise a run credited to this player via
// another batter's record in a game they have no plate appearance in (e.g. a
// pinch-run-only appearance) gets silently dropped. `playerGameIds` is only
// used to decide which years to show and to compute "G" (games played).
const buildRows = async (
  uid,
  records,
  queryGameIds,
  playerGameIds,
  unlockGamesPrefixed,
) => {
  const years = [...new Set(playerGameIds.map(yearOf))].sort();
  const rows = [];
  for (const year of years) {
    const yearQueryGameIds = queryGameIds.filter(id => yearOf(id) === year);
    const yearPlayerGameIds = playerGameIds.filter(id => yearOf(id) === year);
    const stat = await genStats(uid, records, yearQueryGameIds);
    rows.push({
      year,
      G: yearPlayerGameIds.length,
      ...pickCols(stat),
      unlocked: yearPlayerGameIds.some(id => unlockGamesPrefixed.includes(id)),
    });
  }
  return rows;
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
      const rows = await buildRows(
        uid,
        records,
        queryGameIds,
        playerGameIds,
        unlockGamesPrefixed,
      );
      const totalStat = await genStats(uid, records, queryGameIds);
      const total = {
        G: playerGameIds.length,
        ...pickCols(totalStat),
        unlocked: playerGameIds.some(id => unlockGamesPrefixed.includes(id)),
      };

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
          const rows = await buildRows(
            uid,
            combinedRecords,
            combinedQueryGameIds,
            combinedPlayerGameIds,
            combinedUnlockGamesPrefixed,
          );
          const totalStat = await genStats(
            uid,
            combinedRecords,
            combinedQueryGameIds,
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
            total: {
              G: combinedPlayerGameIds.length,
              ...pickCols(totalStat),
              unlocked: combinedPlayerGameIds.some(id =>
                combinedUnlockGamesPrefixed.includes(id),
              ),
            },
          });
        }
      }
    }

    commit(types.SET_CAREER, {
      playerName: account.name || '',
      photo: account.photo || '',
      sections,
    });
    commit(types.SET_LOADING, false);
  },
};

const mutations = {
  [types.SET_LOADING](state, value) {
    state.loading = value;
  },
  [types.SET_CAREER](state, { playerName, photo, sections }) {
    state.playerName = playerName;
    state.photo = photo;
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
