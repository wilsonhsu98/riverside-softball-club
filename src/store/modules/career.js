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
  pitcherSections: [],
};

const getters = {
  careerLoading: state => state.loading,
  careerPlayerName: state => state.playerName,
  careerPhoto: state => state.photo,
  careerSections: state => state.sections,
  careerPitcherSections: state => state.pitcherSections,
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

const PITCHER_STAT_KEYS = [
  'W',
  'L',
  'ERA',
  'G',
  'GS',
  'IP',
  'H',
  'R',
  'NP',
  'BB',
  'SO',
  'WHIP',
  'S%',
  'PIP',
  'K7',
  'BB7',
  'H7',
];
// 跟 execGenPitcherStatistics 裡 OUT === 0 時的預設值一致，只有在整個區間完全沒有
// 該球員的投手資料（理論上不該發生，因為年度清單本來就是從有投球紀錄的比賽算出來的）
// 才會用到這組保底值。
const PITCHER_ZERO_STAT = {
  W: 0,
  L: 0,
  ERA: '-',
  G: 0,
  GS: '-',
  IP: '-',
  H: '-',
  R: '-',
  NP: '-',
  BB: '-',
  SO: '-',
  WHIP: '-',
  'S%': '-',
  PIP: '-',
  K7: '-',
  BB7: '-',
  H7: '-',
};

const pickPitcherCols = stat =>
  PITCHER_STAT_KEYS.reduce((acc, key) => {
    acc[key] =
      stat && stat[key] !== undefined ? stat[key] : PITCHER_ZERO_STAT[key];
    return acc;
  }, {});

// 跟 renameInTeamRecords 同樣的道理：把整隊的比賽都轉成跟 state.games 同形狀的物件
// （game id 前綴隊碼避免跨隊撞名，pitcher/pitchers 裡的球員名字換成 uid），而不是只挑
// 這個人投過的比賽，這樣 GenPitcherStatisticsBatch 才能算出正確的 G／W／L 場次。只挑
// genPitcherStatistics 實際會用到的欄位，不用把整場的 orders 打席紀錄也序列化過去。
const buildPitcherGames = (docs, nameInTeam, uid, teamCode) =>
  docs.map(doc => {
    const { pitcher, pitchers, result } = doc.data();
    return {
      game: `${teamCode}::${doc.id}`,
      result,
      pitcher: Array.isArray(pitcher)
        ? pitcher.map(name => (name === nameInTeam ? uid : name))
        : pitcher === nameInTeam
        ? uid
        : pitcher,
      pitchers: Array.isArray(pitchers)
        ? pitchers.map(p =>
            p && p.name === nameInTeam ? { ...p, name: uid } : p,
          )
        : pitchers,
    };
  });

const isPlayerPitcherInGame = (game, uid) =>
  (Array.isArray(game.pitcher)
    ? game.pitcher.includes(uid)
    : game.pitcher === uid) ||
  (Array.isArray(game.pitchers) &&
    game.pitchers.some(p => p && p.name === uid));

const genPitcherStatsBatch = (uid, games, periods, pitcherInn) =>
  callWorkerQueued({
    cmd: 'GenPitcherStatisticsBatch',
    players: [{ id: uid, data: {} }],
    games,
    pitcherInn,
    periods,
  }).then(
    results => new Map(results.map(({ key, result }) => [key, result[0]])),
  );

// `fullGameIds` 是整隊（或合併多隊）所有比賽的 id，用來當每個年度／總計區間篩選比賽的
// 範圍；`pitcherGameIds` 只是這位球員實際上場投球的比賽 id，只拿來決定要顯示哪些年度。
const buildTeamPitcherStats = async (
  playerId,
  games,
  pitcherGameIds,
  fullGameIds,
  unlockGamesPrefixed,
  pitcherInn,
) => {
  const years = [...new Set(pitcherGameIds.map(yearOf))].sort();
  const periods = years.map(year => ({
    key: year,
    games: fullGameIds.filter(id => yearOf(id) === year),
  }));
  periods.push({ key: TOTAL_KEY, games: fullGameIds });

  const statsByKey = await genPitcherStatsBatch(
    playerId,
    games,
    periods,
    pitcherInn,
  );

  const rows = years.map(year => {
    const yearPitcherGameIds = pitcherGameIds.filter(id => yearOf(id) === year);
    return {
      year,
      ...pickPitcherCols(statsByKey.get(year)),
      unlocked: yearPitcherGameIds.some(id => unlockGamesPrefixed.includes(id)),
    };
  });
  const total = {
    ...pickPitcherCols(statsByKey.get(TOTAL_KEY)),
    unlocked: pitcherGameIds.some(id => unlockGamesPrefixed.includes(id)),
  };
  return { rows, total };
};

// 跟生涯打擊成績的分隊／跨隊彙總排列邏輯一模一樣，只是資料來源換成投手數據，年度清單
// 也完全獨立（只看這位球員當過投手的比賽），所以另外寫一份而不是共用同一段邏輯。
const buildPitcherSections = async (playerId, teamsWithPitcherData) => {
  const distinctSports = [
    ...new Set(teamsWithPitcherData.map(t => t.teamType)),
  ];
  const sections = [];

  // 不管這位球員生涯只待過一支球隊還是跨了好幾支，每個區塊一律標上隊名——切到投手分頁
  // 時，球隊數可能跟打擊分頁不一樣（例如打擊橫跨兩隊、卻只替其中一隊投過球），沒有隊名
  // 會讓人搞不清楚這份投手成績是哪一隊的。
  for (const sport of SPORT_ORDER) {
    const teamsOfSport = teamsWithPitcherData
      .filter(t => t.teamType === sport)
      .sort((a, b) => a.pitcherFirstYear.localeCompare(b.pitcherFirstYear));
    if (!teamsOfSport.length) continue;

    teamsOfSport.forEach(t => {
      sections.push({
        key: t.teamCode,
        title: t.teamName,
        teamType: sport,
        isAggregate: false,
        rows: t.pitcherRows,
        total: t.pitcherTotal,
      });
    });

    if (teamsOfSport.length > 1) {
      const combinedGames = teamsOfSport.flatMap(t => t.pitcherGames);
      const combinedFullGameIds = teamsOfSport.flatMap(
        t => t.pitcherFullGameIds,
      );
      const combinedPitcherGameIds = teamsOfSport.flatMap(
        t => t.playerPitchGameIds,
      );
      const combinedUnlockGamesPrefixed = teamsOfSport.flatMap(
        t => t.unlockGamesPrefixed,
      );
      const { rows, total } = await buildTeamPitcherStats(
        playerId,
        combinedGames,
        combinedPitcherGameIds,
        combinedFullGameIds,
        combinedUnlockGamesPrefixed,
        // 合併多隊時各隊的局數規則（7/9 局）理論上可能不同，這裡先用第一支隊伍的設定，
        // 沒有更好的單一標準可用。
        teamsOfSport[0].pitcherInn,
      );
      sections.push({
        key: `aggregate-${sport}`,
        title:
          distinctSports.length === 1 ? '生涯' : `${SPORT_LABEL[sport]}生涯`,
        teamType: sport,
        isAggregate: true,
        rows,
        total,
      });
    }
  }
  return sections;
};

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
        pitcherInn = 7,
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

      // 投手年度跟打擊年度各自獨立判斷：這位球員只要在某場比賽的 pitcher／pitchers
      // 裡出現過就算，就算他那年完全沒有打擊紀錄（例如指定打擊制度下的純投手年度）
      // 也一樣算數。
      const pitcherGames = buildPitcherGames(
        gameCollection.docs,
        nameInTeam,
        uid,
        teamCode,
      );
      const pitcherFullGameIds = pitcherGames.map(g => g.game);
      const playerPitchGameIds = pitcherGames
        .filter(g => isPlayerPitcherInGame(g, uid))
        .map(g => g.game);

      if (!playerGameIds.length && !playerPitchGameIds.length) return null;

      const unlockGamesPrefixed = unlockGames.map(id => `${teamCode}::${id}`);
      const [{ rows, total }, pitcherStats] = await Promise.all([
        playerGameIds.length
          ? buildTeamStats(
              uid,
              records,
              queryGameIds,
              playerGameIds,
              unlockGamesPrefixed,
            )
          : Promise.resolve({ rows: [], total: null }),
        playerPitchGameIds.length
          ? buildTeamPitcherStats(
              uid,
              pitcherGames,
              playerPitchGameIds,
              pitcherFullGameIds,
              unlockGamesPrefixed,
              pitcherInn,
            )
          : Promise.resolve({ rows: [], total: null }),
      ]);

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
        pitcherGames,
        pitcherFullGameIds,
        playerPitchGameIds,
        pitcherInn,
        pitcherRows: pitcherStats.rows,
        pitcherTotal: pitcherStats.total,
        pitcherFirstYear: pitcherStats.rows.length
          ? pitcherStats.rows[0].year
          : '9999',
      };
    };

    const teamsWithData = (
      await Promise.all(teamCodes.map(fetchTeamData))
    ).filter(Boolean);

    const battingTeams = teamsWithData.filter(t => t.playerGameIds.length);
    const pitcherTeams = teamsWithData.filter(t => t.playerPitchGameIds.length);

    const distinctSports = [...new Set(battingTeams.map(t => t.teamType))];
    const sections = [];

    // 不管生涯只待過一支球隊還是跨了好幾支，一律標上隊名——理由跟投手分頁一樣：切分頁時
    // 球隊數可能不一樣，沒有隊名會搞不清楚這份成績是哪一隊的。
    for (const sport of SPORT_ORDER) {
      const teamsOfSport = battingTeams
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
        const combinedQueryGameIds = teamsOfSport.flatMap(t => t.queryGameIds);
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
            distinctSports.length === 1 ? '生涯' : `${SPORT_LABEL[sport]}生涯`,
          teamType: sport,
          isAggregate: true,
          rows,
          total,
        });
      }
    }

    const pitcherSections = await buildPitcherSections(uid, pitcherTeams);

    commit(types.SET_CAREER_SECTIONS, { sections, pitcherSections });
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
      pitcherInn = 7,
      name: teamName,
    } = teamDoc.exists ? teamDoc.data() : {};

    if (!teamDoc.exists || !players[playerName]) {
      commit(types.SET_CAREER_SECTIONS, { sections: [], pitcherSections: [] });
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

    const pitcherGames = buildPitcherGames(
      gameCollection.docs,
      playerName,
      playerName,
      teamCode,
    );
    const pitcherFullGameIds = pitcherGames.map(g => g.game);
    const playerPitchGameIds = pitcherGames
      .filter(g => isPlayerPitcherInGame(g, playerName))
      .map(g => g.game);

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
        title: teamName || teamCode,
        teamType,
        isAggregate: false,
        rows,
        total,
      });
    }

    const pitcherSections = [];
    if (playerPitchGameIds.length) {
      const { rows, total } = await buildTeamPitcherStats(
        playerName,
        pitcherGames,
        playerPitchGameIds,
        pitcherFullGameIds,
        unlockGamesPrefixed,
        pitcherInn,
      );
      pitcherSections.push({
        key: teamCode,
        title: teamName || teamCode,
        teamType,
        isAggregate: false,
        rows,
        total,
      });
    }

    commit(types.SET_CAREER_SECTIONS, { sections, pitcherSections });
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
  [types.SET_CAREER_SECTIONS](state, { sections, pitcherSections }) {
    state.sections = sections;
    state.pitcherSections = pitcherSections || [];
  },
  [types.CLEAR_CAREER](state) {
    state.playerName = '';
    state.photo = '';
    state.sections = [];
    state.pitcherSections = [];
  },
};

export { types };
export default {
  state,
  getters,
  actions,
  mutations,
};
