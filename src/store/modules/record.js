import {
  types as rootTypes,
  // getters as rootGetters,
  state as rootState,
} from '../root';
import utils, {
  formatColor,
  innArray,
  sumByInn,
  eraCalc,
} from '../../libs/utils';
import workerCreater from '../../web-worker';

const types = {
  INIT_FROM_LS: 'RECORD/INIT_FROM_LS',
  GET_PERIOD: 'RECORD/GET_PERIOD',
  GET_PLAYERS: 'RECORD/GET_PLAYERS',
  GET_RECORDS: 'RECORD/GET_RECORDS',
  SET_PERIOD: 'RECORD/SET_PERIOD',
  SET_TOP: 'RECORD/SET_TOP',
  SET_UNLIMITED_PA: 'RECORD/SET_UNLIMITED_PA',
  SET_SORTBY: 'RECORD/SET_SORTBY',
  SET_CHECKALL: 'RECORD/SET_CHECKALL',
  SET_COLS: 'RECORD/SET_COLS',
  SET_LASTUPDATE: 'RECORD/SET_LASTUPDATE',
  SET_GAME: 'RECORD/SET_GAME',
  SET_ORDER: 'RECORD/SET_ORDER',
  GET_GAMELIST: 'RECORD/GET_GAMELIST',
  SET_GENSTATISTICS: 'RECORD/SET_GENSTATISTICS',
  SET_ITEMSTATS: 'RECORD/SET_ITEMSTATS',
  SET_BOX: 'RECORD/SET_BOX',
  RESET_PERIOD: 'RECORD/RESET_PERIOD',
  SET_BOX_DISPLAY: 'RECORD/SET_BOX_DISPLAY',
  SET_OTHER_CONDITIONS: 'RECORD/SET_OTHER_CONDITIONS',
  SET_UNION_INTERSECT: 'RECORD/SET_UNION_INTERSECT',
};

const state = {
  players: [],
  records: [],
  period: [{ period: 'period_all', select: true }],
  top: 10,
  unlimitedPA: true,
  sortBy: 'OPS',
  lastUpdate: '',
  cols: [
    { name: 'Rank', visible: true },
    { name: 'name', visible: true },
    { name: 'PA', visible: true },
    { name: 'AB', visible: true },
    { name: 'H', visible: true },
    { name: 'TB', visible: true },
    { name: 'TOB', visible: true },
    { name: 'R', visible: true },
    { name: 'RBI', visible: true },
    { name: '1H', visible: true },
    { name: '2H', visible: true },
    { name: '3H', visible: true },
    { name: 'HR', visible: true },
    { name: 'K', visible: true },
    { name: 'DP', visible: true },
    { name: 'BB', visible: true },
    { name: 'SF', visible: true },
    { name: 'AVG', visible: true },
    { name: 'OBP', visible: true },
    { name: 'SLG', visible: true },
    { name: 'OPS', visible: true },
    { name: 'LEVEL', visible: true },
    { name: 'AVG_NO', visible: true },
    { name: 'AVG_SP', visible: true },
    { name: 'AVG_FB', visible: true },
  ],
  game: '',
  order: 0,
  games: [],
  genStatistics: [],
  itemStats: { AVG: [], H: [], HR: [], RBI: [], W: [] },
  box: [],
  boxDisplay: 'content',
  otherConditions: [],
  unionOrIntersect: 'union',
  conditionGames: [],
  reseting: true,
};

const getters = {
  period: state => state.period,
  periodSelect: state => {
    return state.period.find(item => item.select).period;
  },
  top: state => state.top,
  unlimitedPA: state => state.unlimitedPA,
  sortBy: state => state.sortBy,
  checkAll: state => {
    return (
      state.cols.filter(
        item => item.name !== 'Rank' && item.name !== 'name' && item.visible,
      ).length ===
      state.cols.filter(item => item.name !== 'Rank' && item.name !== 'name')
        .length
    );
  },
  conditionCols: state => {
    return state.cols
      .filter(item => item.name !== 'Rank' && item.name !== 'name')
      .map(item => ({
        name: item.name,
        visible: item.visible,
        disabled: item.name === state.sortBy,
      }));
  },
  genStatistics: state => state.genStatistics,
  displayedCols: state => {
    return state.cols.filter(item => item.visible);
  },
  lastUpdate: state => state.lastUpdate,
  pa: state => {
    return state.records.find(
      item =>
        item._table === state.game && `${item.order}` === `${state.order}`,
    );
  },
  boxSummary: state => {
    const boxSummary =
      (state.games.length &&
        state.game &&
        state.games.find(item => item.game === state.game)) ||
      {};
    const allowedGameTypes =
      boxSummary.gameType === 'fun' ? ['fun'] : ['regular', 'playoff', 'cup'];
    const game = state.records.filter(item => item._table === state.game);
    const beforePitchers = state.games
      .filter(
        item =>
          allowedGameTypes.includes(item.gameType) &&
          parseInt(item.game.replace('-', ''), 10) <
            parseInt(state.game.replace('-', ''), 10) &&
          Array.isArray(item.pitchers),
      )
      .map(item => item.pitchers)
      .flat();
    return {
      ...boxSummary,
      result: boxSummary.result,
      h: game.filter(item => ['1H', '2H', '3H', 'HR'].includes(item.content))
        .length,
      r:
        game.filter(item => item.r).length ||
        game
          .filter(item => Array.isArray(item.onbase))
          .reduce((acc, item) => {
            if (item.onbase[0].result === 'run') acc += 1;
            if (item.onbase[1].result === 'run') acc += 1;
            if (item.onbase[2].result === 'run') acc += 1;
            if (item.onbase[3].result === 'run') acc += 1;
            return acc;
          }, 0),
      e: (boxSummary.errors || []).reduce(
        (result, item) => result + item.count,
        0,
      ),
      contents: game,
      opponentScores: boxSummary.opponentScores || [],
      scores: game.reduce((acc, item) => {
        if (typeof item.inn === 'number') {
          acc.length = item.inn;
          acc[item.inn - 1] = (acc[item.inn - 1] || 0) + (item.r ? 1 : 0);
          if (Array.isArray(item.onbase)) {
            acc[item.inn - 1] +=
              (item.onbase[0].result === 'run' ? 1 : 0) +
              (item.onbase[1].result === 'run' ? 1 : 0) +
              (item.onbase[2].result === 'run' ? 1 : 0) +
              (item.onbase[3].result === 'run' ? 1 : 0);
          }
        }
        return acc;
      }, []),
      pitchersRaw: boxSummary.pitchers,
      beforePitchers,
      pitchers:
        Array.isArray(boxSummary.pitchers) && boxSummary.pitchers.length
          ? boxSummary.pitchers.map((p, i, self) => {
              const OUT = sumByInn(p.OUT);
              const decimal = OUT % 3;
              const IP = `${Math.floor(OUT / 3)}${
                decimal > 0 ? `.${decimal}` : ''
              }`;
              return {
                IP,
                H: sumByInn(p.H),
                R: sumByInn(p.R),
                BB: sumByInn(p.BB),
                SO: sumByInn(p.SO),
                ERA: eraCalc(beforePitchers, self, i),
                name: p.name,
              };
            })
          : [],
    };
  },
  games: state => state.games,
  records: state => {
    return state.records;
  },
  gamesResult: state =>
    state.conditionGames
      .filter(item =>
        (state.period.find(item => item.select).games || []).includes(
          item.game,
        ),
      )
      .reduce(
        ({ win, lose, tie }, item) => {
          const w = win + (item.result === 'win' ? 1 : 0);
          const l = lose + (item.result === 'lose' ? 1 : 0);
          const t = tie + (item.result === 'tie' ? 1 : 0);
          return {
            win: w,
            lose: l,
            tie: t,
            maxLength: Math.max(`${w}`.length, `${l}`.length, `${t}`.length),
          };
        },
        { win: 0, lose: 0, tie: 0 },
      ),
  groupGames: state => {
    if (state.reseting) return undefined;
    return utils.genGameList(
      state.conditionGames,
      (state.period.find(item => item.select) || { games: [] }).games,
    );
  },
  gameOptions: state => {
    const concat = (acc, item, col) => {
      const values = [].concat(item[col]);
      return values.reduce((acc, text) => {
        const find = acc.find(prev => prev.text === text);
        if (find) {
          return [
            ...acc.filter(prev => prev.text !== text),
            { text, count: find.count + 1 },
          ];
        } else if (text) {
          return acc.concat({ text, count: 1 });
        } else {
          return acc;
        }
      }, acc[col]);
    };
    const filterGames = (
      state.period.find(item => item.select) || { games: [] }
    ).games;
    return state.games
      .filter(item => filterGames.includes(item.game))
      .reduce(
        (acc, item, i, self) => {
          if (i === self.length - 1) {
            return {
              opponent: concat(acc, item, 'opponent').sort(
                (a, b) => a.text.localeCompare(b.text),
                'zh-TW',
              ),
              league: concat(acc, item, 'league').sort(
                (a, b) => a.text.localeCompare(b.text),
                'zh-TW',
              ),
              group: concat(acc, item, 'group').sort(
                (a, b) => a.text.localeCompare(b.text),
                'zh-TW',
              ),
              period: concat(acc, item, 'period').sort(
                (a, b) => a.text.localeCompare(b.text),
                'zh-TW',
              ),
              coach: concat(acc, item, 'coach').sort(
                (a, b) => a.text.localeCompare(b.text),
                'zh-TW',
              ),
              recorder: concat(acc, item, 'recorder').sort(
                (a, b) => a.text.localeCompare(b.text),
                'zh-TW',
              ),
              tags: concat(acc, item, 'tags').sort(
                (a, b) => a.text.localeCompare(b.text),
                'zh-TW',
              ),
            };
          } else {
            return {
              opponent: concat(acc, item, 'opponent'),
              league: concat(acc, item, 'league'),
              group: concat(acc, item, 'group'),
              period: concat(acc, item, 'period'),
              coach: concat(acc, item, 'coach'),
              recorder: concat(acc, item, 'recorder'),
              tags: concat(acc, item, 'tags'),
            };
          }
        },
        {
          opponent: [],
          league: [],
          group: [],
          period: [],
          coach: [],
          recorder: [],
          tags: [],
        },
      );
  },
  game: state => state.game,
  periodGames: state => state.period.find(item => item.select).games || [],
  itemStats: state => state.itemStats,
  box: state => state.box,
  boxDisplay: state => state.boxDisplay,
  otherConditions: state => state.otherConditions,
  unionOrIntersect: state => state.unionOrIntersect,
};

const actions = {
  initFromLS({ commit }) {
    commit(types.INIT_FROM_LS);
  },
  operateGames({ commit }, changedData) {
    const dates = changedData
      .filter(item => item.data.timestamp)
      .map(item => new Date(item.data.timestamp.seconds * 1000));
    if (dates.length) {
      const lastDate = new Date(Math.max.apply(null, dates));
      commit(types.SET_LASTUPDATE, lastDate);
    }
    const records = changedData
      .filter(item => item.data.orders)
      .map(item => {
        return item.data.orders.map(sub => ({
          ...sub,
          _table: item.id,
        }));
      })
      .reduce((a, b) => a.concat(b), []);
    const period = changedData.map(item => {
      const { orders, ...others } = item.data;
      orders;
      return { ...others, game: item.id };
    });
    commit(types.GET_PERIOD, period);
    commit(types.GET_RECORDS, records);
    commit(types.GET_GAMELIST, period);
    actions.workerGenStatistics({ commit });
    actions.workerItemStats({ commit });
    actions.workerBox({ commit });
  },
  setPeriod({ commit }, value) {
    commit(types.SET_PERIOD, value);
    actions.workerGenStatistics({ commit });
    actions.workerItemStats({ commit });
  },
  setTop({ commit }, value) {
    commit(types.SET_TOP, value);
    actions.workerGenStatistics({ commit });
  },
  setUnlimitedPA({ commit }, value) {
    commit(types.SET_UNLIMITED_PA, value);
    actions.workerGenStatistics({ commit });
  },
  setSortBy({ commit }, value) {
    commit(types.SET_SORTBY, value);
    commit(types.SET_COLS, { col: value, visible: true });
    actions.workerGenStatistics({ commit });
  },
  setCheckAll({ commit }, isCheckAll) {
    commit(types.SET_CHECKALL, isCheckAll);
  },
  toggleColumn({ commit }, col) {
    commit(types.SET_COLS, { col });
  },
  setGame({ commit }, gameDate) {
    commit(types.SET_GAME, gameDate);
    actions.workerBox({ commit });
  },
  setOrder({ commit }, order) {
    commit(types.SET_ORDER, order);
  },
  workerGenStatistics({ commit }) {
    commit(rootTypes.LOADING, true);
    workerCreater(
      {
        cmd: 'GenStatistics',
        players: state.players,
        records: state.records,
        unlimitedPA: state.unlimitedPA,
        top: state.top,
        period: state.period,
        sortBy: state.sortBy,
      },
      data => {
        commit(types.SET_GENSTATISTICS, data);
        commit(rootTypes.LOADING, false);
      },
    );
  },
  workerItemStats({ commit }) {
    commit(rootTypes.LOADING, true);
    workerCreater(
      {
        cmd: 'ItemStats',
        players: state.players,
        records: state.records,
        period: state.period,
        games: state.games,
      },
      data => {
        commit(types.SET_ITEMSTATS, data);
        commit(rootTypes.LOADING, false);
      },
    );
  },
  workerBox({ commit }) {
    // commit(rootTypes.LOADING, true);
    if (state.game && state.records.some(item => item._table === state.game)) {
      // const test = displayGame(
      //   state.players,
      //   state.records.filter(item => item._table === state.game),
      //   state.games.find(item => item.game === state.game).errors,
      //   rootState.role,
      // );
      // console.log(test);
      // commit(types.SET_BOX, test);
      // return;
      workerCreater(
        {
          cmd: 'Box',
          games: state.games,
          game: state.game,
          players: state.players,
          records: state.records,
          role: rootState.role,
        },
        data => {
          commit(types.SET_BOX, data);
          // commit(rootTypes.LOADING, false);
        },
      );
    } else {
      commit(types.SET_BOX, []);
    }
  },
  setBoxDisplay({ commit }, value) {
    commit(types.SET_BOX_DISPLAY, value);
  },
  setOtherConditions({ commit }, value) {
    commit(types.SET_OTHER_CONDITIONS, value);
  },
  setUnionOrIntersect({ commit }, value) {
    commit(types.SET_UNION_INTERSECT, value);
  },
};

const mutations = {
  [types.INIT_FROM_LS](state) {
    state.top =
      parseInt(window.localStorage.getItem('pref_top'), 10) || state.top;
    state.unlimitedPA =
      window.localStorage.getItem('pref_unlimited_pa') === 'true' ||
      state.unlimitedPA;
    state.sortBy = window.localStorage.getItem('pref_sortby') || state.sortBy;
    state.boxDisplay =
      window.localStorage.getItem('pref_box_display') || state.boxDisplay;
    state.unionOrIntersect =
      window.localStorage.getItem('pref_union_intersect') ||
      state.unionOrIntersect;

    const pref_period = window.localStorage.getItem('pref_period');
    if (pref_period) state.period = JSON.parse(pref_period);
    const pref_cols = window.localStorage.getItem('pref_cols');
    if (pref_cols) state.cols = JSON.parse(pref_cols);
    const pref_other_conditions = window.localStorage.getItem(
      'pref_other_conditions',
    );
    if (pref_other_conditions)
      state.otherConditions = JSON.parse(pref_other_conditions);
  },
  [types.RESET_PERIOD](state) {
    state.reseting = true;
    state.period = [{ period: 'period_all', select: true }];
    state.otherConditions = [];
  },
  [types.GET_PERIOD](state, data) {
    const period = [
      { period: 'period_all' },
      ...data.map(item => ({ period: item.period })),
      ...data
        .filter(item => !isNaN(parseInt(item.period)))
        .map(item => ({ period: `${parseInt(item.period)}` })),
    ]
      .filter((value, index, self) => {
        return (
          value &&
          value.period !== undefined &&
          self.map(item => item.period).indexOf(value.period) === index
        );
      })
      .sort((a, b) => {
        return b.period.localeCompare(a.period);
      })
      .map(item => {
        if (item.period === 'period_all') {
          return {
            ...item,
            games: data
              .map(sub => sub.game)
              .sort((a, b) => {
                return (
                  parseInt((b.match(/\d/g) || [b]).join(''), 10) -
                  parseInt((a.match(/\d/g) || [a]).join(''), 10)
                );
              }),
          };
        } else if (item.period && !isNaN(item.period)) {
          return {
            ...item,
            games: data
              .filter(sub => `${parseInt(sub.period)}` === item.period)
              .map(sub => sub.game),
          };
        } else {
          return {
            ...item,
            games: data
              .filter(sub => sub.period === item.period)
              .map(sub => sub.game),
          };
        }
      });
    const prevSelect = (state.period.find(item => item.select) || {}).period;
    const select = period.map(item => item.period).includes(prevSelect)
      ? prevSelect
      : 'period_all';
    state.reseting = false;
    state.period = period.map(item => ({
      ...item,
      select: item.period === select,
    }));
  },
  [types.GET_PLAYERS](state, data) {
    state.players = data;
  },
  [types.GET_RECORDS](state, data) {
    state.records = data;
  },
  [types.SET_PERIOD](state, data) {
    state.period = state.period.map(item => ({
      ...item,
      select: item.period === data,
    }));
    window.localStorage.setItem('pref_period', JSON.stringify(state.period));
  },
  [types.SET_TOP](state, value) {
    state.top = value;
    window.localStorage.setItem('pref_top', state.top);
  },
  [types.SET_UNLIMITED_PA](state, value) {
    state.unlimitedPA = value;
    window.localStorage.setItem('pref_unlimited_pa', state.unlimitedPA);
  },
  [types.SET_SORTBY](state, value) {
    state.sortBy = value;
    window.localStorage.setItem('pref_sortby', state.sortBy);
  },
  [types.SET_CHECKALL](state, isCheckAll) {
    state.cols = state.cols.map(item => ({
      ...item,
      visible: ['Rank', 'name', state.sortBy].includes(item.name) || isCheckAll,
    }));
    window.localStorage.setItem('pref_cols', JSON.stringify(state.cols));
  },
  [types.SET_COLS](state, { col, visible }) {
    state.cols = state.cols.map(item => ({
      ...item,
      visible: item.name === col ? visible || !item.visible : item.visible,
    }));
    window.localStorage.setItem('pref_cols', JSON.stringify(state.cols));
  },
  [types.SET_LASTUPDATE](state, date) {
    state.lastUpdate = date;
  },
  [types.SET_GAME](state, data) {
    state.game = data;
  },
  [types.SET_ORDER](state, data) {
    state.order = data;
  },
  [types.GET_GAMELIST](state, data) {
    state.games = data;
    state.conditionGames = utils.unionOrIntersect(
      state.unionOrIntersect,
      state.otherConditions,
      state.games,
    );
  },
  [types.SET_GENSTATISTICS](state, data) {
    state.genStatistics = data;
  },
  [types.SET_ITEMSTATS](state, data) {
    state.itemStats = data;
  },
  [types.SET_BOX](state, data) {
    state.box = data;
  },
  [types.SET_BOX_DISPLAY](state, value) {
    state.boxDisplay = value;
    window.localStorage.setItem('pref_box_display', state.boxDisplay);
  },
  [types.SET_OTHER_CONDITIONS](state, data) {
    state.otherConditions = data;
    window.localStorage.setItem(
      'pref_other_conditions',
      JSON.stringify(state.otherConditions),
    );
    state.conditionGames = utils.unionOrIntersect(
      state.unionOrIntersect,
      state.otherConditions,
      state.games,
    );
  },
  [types.SET_UNION_INTERSECT](state, data) {
    state.unionOrIntersect = data;
    window.localStorage.setItem('pref_union_intersect', state.unionOrIntersect);
    state.conditionGames = utils.unionOrIntersect(
      state.unionOrIntersect,
      state.otherConditions,
      state.games,
    );
  },
};

export { types, actions };
export default {
  state,
  getters,
  actions,
  mutations,
};
