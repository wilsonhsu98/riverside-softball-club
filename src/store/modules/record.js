import {
  types as rootTypes,
  // getters as rootGetters,
  state as rootState,
} from '../root';
import utils from '../../libs/utils';
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
};

const state = {
  players: [],
  records: [],
  period: [{ period: 'period_all', select: true }],
  top: 10,
  unlimitedPA: false,
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
  ],
  game: '',
  order: 0,
  games: [],
  genStatistics: [],
  itemStats: { AVG: [], H: [], HR: [], RBI: [] },
  box: [],
  boxDisplay: 'content',
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
    const game = state.records.filter(item => item._table === state.game);
    return {
      ...boxSummary,
      result: boxSummary.result,
      h: game.filter(
        item => ['1H', '2H', '3H', 'HR'].indexOf(item.content) > -1,
      ).length,
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
    };
  },
  games: state => state.games,
  groupGames: state =>
    utils.genGameList(
      state.games,
      (state.period.find(item => item.select) || { games: [] }).games,
    ),
  gameOptions: state =>
    state.games.reduce(
      (acc, item, i, self) => {
        if (i === self.length - 1) {
          return {
            opponent: [...new Set(acc.opponent.concat(item.opponent))]
              .filter(item => !!item)
              .sort((a, b) => a.localeCompare(b), 'zh-TW'),
            league: [...new Set(acc.league.concat(item.league))]
              .filter(item => !!item)
              .sort((a, b) => a.localeCompare(b), 'zh-TW'),
            group: [...new Set(acc.group.concat(item.group))]
              .filter(item => !!item)
              .sort((a, b) => a.localeCompare(b), 'zh-TW'),
            period: [...new Set(acc.period.concat(item.period))]
              .filter(item => !!item)
              .sort((a, b) => b.localeCompare(a), 'zh-TW'),
            tags: [...new Set(acc.tags.concat(item.tags))]
              .filter(item => !!item)
              .sort((a, b) => b.localeCompare(a), 'zh-TW'),
          };
        } else {
          return {
            opponent: acc.opponent.concat(item.opponent),
            league: acc.league.concat(item.league),
            group: acc.group.concat(item.group),
            period: acc.period.concat(item.period),
            tags: acc.tags.concat(item.tags),
          };
        }
      },
      { opponent: [], league: [], group: [], period: [], tags: [] },
    ),
  game: state => state.game,
  periodGames: state => state.period.find(item => item.select).games || [],
  itemStats: state => state.itemStats,
  box: state => state.box,
  boxDisplay: state => state.boxDisplay,
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
  operatePlayers({ commit }, { players }) {
    commit(types.GET_PLAYERS, players);
    actions.workerGenStatistics({ commit });
    actions.workerItemStats({ commit });
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

    const pref_period = window.localStorage.getItem('pref_period');
    if (pref_period) state.period = JSON.parse(pref_period);
    const pref_cols = window.localStorage.getItem('pref_cols');
    if (pref_cols) state.cols = JSON.parse(pref_cols);
  },
  [types.RESET_PERIOD](state) {
    state.period = [{ period: 'period_all', select: true }];
  },
  [types.GET_PERIOD](state, data) {
    state.period.find(item => item.period === 'period_all').games = data
      .map(item => item.game)
      .sort((a, b) => {
        return (
          parseInt(b.match(/\d/g).join(''), 10) -
          parseInt(a.match(/\d/g).join(''), 10)
        );
      });

    state.period = state.period.filter(
      (value, index, self) =>
        self.map(item => item.period).indexOf(value.period) === index,
    );

    data
      .map(item => item.period)
      .filter((value, index, self) => self.indexOf(value) === index)
      .map(item => ({
        period: item,
        games: data.filter(sub => sub.period === item).map(sub => sub.game),
      }))
      .concat(
        data
          .map(item => parseInt(item.period))
          .filter(
            (value, index, self) =>
              self.indexOf(value) === index && !isNaN(value),
          )
          .map(item => ({
            period: `${item}`,
            games: data
              .filter(sub => parseInt(sub.period) === item)
              .map(sub => sub.game),
          })),
      )
      .forEach(item => {
        const find = state.period.find(sub => sub.period === item.period);
        if (!find) {
          state.period = Array.from(state.period).concat([item]);
        } else {
          find.games = item.games;
        }
      });

    state.period = Array.from(state.period).sort((a, b) =>
      b.period.localeCompare(a.period),
    );
    if (!state.period.find(item => item.select)) {
      state.period.find(item => item.period === 'period_all').select = true;
    }
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
};

export { types, actions };
export default {
  state,
  getters,
  actions,
  mutations,
};
