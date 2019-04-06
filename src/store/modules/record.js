import {
  types as rootTypes
  // getters as rootGetters,
  // state as rootState
} from "../root";
import utils from "../../libs/utils";
import { db } from "../../firebase";

let snapShotGames;
let snapShotplayers;

const types = {
  INIT_FROM_LS: "RECORD/INIT_FROM_LS",
  GET_PERIOD: "RECORD/GET_PERIOD",
  GET_PLAYERS: "RECORD/GET_PLAYERS",
  GET_RECORDS: "RECORD/GET_RECORDS",
  SET_PERIOD: "RECORD/SET_PERIOD",
  SET_TOP: "RECORD/SET_TOP",
  SET_UNLIMITED_PA: "RECORD/SET_UNLIMITED_PA",
  SET_SORTBY: "RECORD/SET_SORTBY",
  SET_CHECKALL: "RECORD/SET_CHECKALL",
  SET_COLS: "RECORD/SET_COLS",
  DEL_PLAYER: "RECORD/DEL_PLAYER",
  REFRESH_PLAYER: "RECORD/REFRESH_PLAYER",
  SET_LASTUPDATE: "RECORD/SET_LASTUPDATE",
  SET_GAME: "RECORD/SET_GAME",
  SET_ORDER: "RECORD/SET_ORDER",
  GET_GAMELIST: "RECORD/GET_GAMELIST"
};

const state = {
  players: [],
  records: [],
  period: [{ period: "period_all", select: true }],
  top: 10,
  unlimitedPA: false,
  hiddenPlayer: [],
  sortBy: "OPS",
  lastUpdate: "",
  cols: [
    { name: "Rank", visible: true },
    { name: "name", visible: true },
    { name: "PA", visible: true },
    { name: "AB", visible: true },
    { name: "H", visible: true },
    { name: "TB", visible: true },
    { name: "TOB", visible: true },
    { name: "R", visible: true },
    { name: "RBI", visible: true },
    { name: "1H", visible: true },
    { name: "2H", visible: true },
    { name: "3H", visible: true },
    { name: "HR", visible: true },
    { name: "K", visible: true },
    { name: "DP", visible: true },
    { name: "BB", visible: true },
    { name: "SF", visible: true },
    { name: "AVG", visible: true },
    { name: "OBP", visible: true },
    { name: "SLG", visible: true },
    { name: "OPS", visible: true }
  ],
  game: "",
  order: 0,
  gameList: []
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
        item => item.name !== "Rank" && item.name !== "name" && item.visible
      ).length ===
      state.cols.filter(item => item.name !== "Rank" && item.name !== "name")
        .length
    );
  },
  conditionCols: state => {
    return state.cols
      .filter(item => item.name !== "Rank" && item.name !== "name")
      .map(item => ({
        name: item.name,
        visible: item.visible,
        disabled: item.name === state.sortBy
      }));
  },
  genStatistics: state => {
    return utils
      .genStatistics(
        state.players,
        state.records,
        state.unlimitedPA ? undefined : state.top,
        state.period.find(item => item.select).games
      )
      .filter(
        item =>
          item.PA !== "-" &&
          (state.unlimitedPA || item.PA === state.top) &&
          state.hiddenPlayer.indexOf(item.name) === -1
      )
      .sort((a, b) => {
        if (["AVG", "OBP", "SLG", "OPS"].indexOf(state.sortBy) > -1) {
          return b[state.sortBy] === a[state.sortBy]
            ? b["PA"] - a["PA"]
            : b[state.sortBy] - a[state.sortBy];
        } else {
          if (b[state.sortBy] === 0 && a[state.sortBy] === 0) {
            return b["PA"] - a["PA"];
          } else {
            return b[state.sortBy] === a[state.sortBy]
              ? a["PA"] - b["PA"]
              : b[state.sortBy] - a[state.sortBy];
          }
        }
      });
  },
  displayedCols: state => {
    return state.cols.filter(item => item.visible);
  },
  lastUpdate: state => state.lastUpdate,
  box: state => {
    const boxSummary =
      state.gameList.length &&
      state.game &&
      state.gameList
        .find(item => item.games.find(sub => sub.game === state.game))
        .games.find(item => item.game === state.game);
    return utils.displayGame(
      state.players,
      state.records.filter(item => item._table === state.game),
      boxSummary.errors
    );
  },
  pa: state => {
    return state.records.find(
      item => item._table === state.game && `${item.order}` === `${state.order}`
    );
  },
  boxSummary: state => {
    const boxSummary =
      state.gameList.length &&
      state.game &&
      state.gameList
        .find(item => item.games.find(sub => sub.game === state.game))
        .games.find(item => item.game === state.game);
    const game = state.records.filter(item => item._table === state.game);

    return Object.assign({}, boxSummary, {
      result: boxSummary.result,
      h: game.filter(
        item => ["1H", "2H", "3H", "HR"].indexOf(item.content) > -1
      ).length,
      r: game.filter(item => item.r).length,
      e: (boxSummary.errors || []).reduce(
        (result, item) => result + item.count,
        0
      ),
      contents: game
    });
  },
  gameList: state => state.gameList,
  periodGames: state => state.period.find(item => item.select).games || [],
  itemStats: state => {
    const games = state.period.find(item => item.select).games || [];
    const minimunPA = games.length * 1.6;
    const records = utils.genStatistics(
      state.players,
      state.records,
      undefined,
      games
    );
    return {
      AVG: records
        .filter(item => item.PA !== "-" && item.AVG > 0 && item.PA >= minimunPA)
        .sort((a, b) =>
          b["AVG"] === a["AVG"] ? b["PA"] - a["PA"] : b["AVG"] - a["AVG"]
        )
        .map(item => ({
          name: item.name,
          PA: item.PA,
          AVG: item.AVG.toFixed(3),
          data: item.data
        })),
      H: records
        .filter(item => item.PA !== "-" && item.H > 0)
        .sort((a, b) =>
          b["H"] === a["H"] ? a["PA"] - b["PA"] : b["H"] - a["H"]
        )
        .map(item => ({
          name: item.name,
          PA: item.PA,
          H: item.H,
          data: item.data
        })),
      HR: records
        .filter(item => item.PA !== "-" && item.HR > 0)
        .sort((a, b) =>
          b["HR"] === a["HR"] ? a["PA"] - b["PA"] : b["HR"] - a["HR"]
        )
        .map(item => ({
          name: item.name,
          PA: item.PA,
          HR: item.HR,
          data: item.data
        })),
      RBI: records
        .filter(item => item.PA !== "-" && item.RBI > 0)
        .sort((a, b) =>
          b["RBI"] === a["RBI"] ? a["PA"] - b["PA"] : b["RBI"] - a["RBI"]
        )
        .map(item => ({
          name: item.name,
          PA: item.PA,
          RBI: item.RBI,
          data: item.data
        }))
    };
  }
};

const actions = {
  initFromLS({ commit }) {
    commit(types.INIT_FROM_LS);
  },
  fetchTable({ commit }, team) {
    const operateGames = changedData => {
      const dates = changedData
        .filter(item => item.data.timestamp)
        .map(item => item.data.timestamp.toDate());
      if (dates.length) {
        const lastDate = new Date(Math.max.apply(null, dates));
        commit(types.SET_LASTUPDATE, lastDate);
        window.localStorage.setItem("lastUpdate", lastDate);
      }
      const records = changedData
        .filter(item => item.data.orders)
        .map(item => {
          item.data.orders.forEach(sub => {
            sub._table = item.id;
          });
          return item.data.orders;
        })
        .reduce((a, b) => a.concat(b), []);
      const period = changedData.map(item => {
        if (item.data.orders && item.data.orders.length) {
          // item.data.hasOrder = true;
          delete item.data.orders;
        } else {
          // item.data.hasOrder = false;
        }
        return Object.assign({}, item.data, { game: item.id });
      });
      commit(types.GET_PERIOD, period);
      commit(types.GET_RECORDS, records);
      commit(types.GET_GAMELIST, period);
      window.localStorage.setItem("period", JSON.stringify(period));
      window.localStorage.setItem("records", JSON.stringify(records));
    };
    const operatePlayers = players => {
      db.collection("accounts")
        .where("teams", "array-contains", team)
        .get()
        .then(accountCollection => {
          const accounts = players.map(player => {
            const find = accountCollection.docs.find(
              account => account.id === player.data.uid
            );
            return {
              id: player.id,
              data: {
                ...player.data,
                photo: find && find.data().photo
              }
            };
          });
          commit(types.GET_PLAYERS, accounts);
          window.localStorage.setItem("players", JSON.stringify(accounts));
        });
    };

    if (
      window.localStorage.getItem("players") &&
      window.localStorage.getItem("period") &&
      window.localStorage.getItem("records")
    ) {
      commit(
        types.GET_PLAYERS,
        JSON.parse(window.localStorage.getItem("players"))
      );
      commit(
        types.GET_PERIOD,
        JSON.parse(window.localStorage.getItem("period"))
      );
      commit(
        types.GET_RECORDS,
        JSON.parse(window.localStorage.getItem("records"))
      );
      commit(
        types.GET_GAMELIST,
        JSON.parse(window.localStorage.getItem("period"))
      );
      if (window.localStorage.getItem("lastUpdate")) {
        commit(types.SET_LASTUPDATE, window.localStorage.getItem("lastUpdate"));
      }
    }
    commit(rootTypes.LOADING, true);
    let queryCount = 0;
    const realtimeCount = 2;
    if (typeof snapShotGames === "function") snapShotGames();
    snapShotGames = db
      .collection("teams")
      .doc(team)
      .collection("games")
      .onSnapshot(snapshot => {
        queryCount += 1;
        if (queryCount > realtimeCount) {
          // realtime
          commit(rootTypes.LOADING, { text: "New data is coming" });
          setTimeout(() => {
            operateGames(
              snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
            );
            commit(rootTypes.LOADING, false);
          }, 1000);
        } else {
          // first time
          operateGames(
            snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
          );
          if (queryCount === realtimeCount) {
            commit(rootTypes.LOADING, false);
          }
        }
      });
    if (typeof snapShotplayers === "function") snapShotplayers();
    snapShotplayers = db
      .collection("teams")
      .doc(team)
      .collection("players")
      .onSnapshot(snapshot => {
        queryCount += 1;
        if (queryCount > realtimeCount) {
          // realtime
          commit(rootTypes.LOADING, { text: "New data is coming" });
          setTimeout(() => {
            operatePlayers(
              snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
            );
            commit(rootTypes.LOADING, false);
          }, 1000);
        } else {
          // first time
          operatePlayers(
            snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
          );
          if (queryCount === realtimeCount) {
            commit(rootTypes.LOADING, false);
          }
        }
      });
  },
  setPeriod({ commit }, value) {
    commit(types.SET_PERIOD, value);
  },
  setTop({ commit }, value) {
    commit(types.SET_TOP, value);
  },
  setUnlimitedPA({ commit }, value) {
    commit(types.SET_UNLIMITED_PA, value);
  },
  setSortBy({ commit }, value) {
    commit(types.SET_SORTBY, value);
    commit(types.SET_COLS, { col: value, visible: true });
  },
  setCheckAll({ commit }, isCheckAll) {
    commit(types.SET_CHECKALL, isCheckAll);
  },
  toggleColumn({ commit }, col) {
    commit(types.SET_COLS, { col });
  },
  deletePlayer({ commit }, player) {
    commit(types.DEL_PLAYER, player);
  },
  refreshPlayer({ commit }) {
    commit(types.REFRESH_PLAYER);
  },
  setGame({ commit }, gemeDate) {
    commit(types.SET_GAME, gemeDate);
  },
  setOrder({ commit }, order) {
    commit(types.SET_ORDER, order);
  }
};

const mutations = {
  [types.INIT_FROM_LS](state) {
    state.top =
      parseInt(window.localStorage.getItem("pref_top"), 10) || state.top;
    state.unlimitedPA =
      window.localStorage.getItem("pref_unlimited_pa") === "true" ||
      state.unlimitedPA;
    state.sortBy = window.localStorage.getItem("pref_sortby") || state.sortBy;

    const pref_period = window.localStorage.getItem("pref_period");
    if (pref_period) state.period = JSON.parse(pref_period);
    const pref_cols = window.localStorage.getItem("pref_cols");
    if (pref_cols) state.cols = JSON.parse(pref_cols);
    const pref_hiddenplayer = window.localStorage.getItem("pref_hiddenplayer");
    if (pref_hiddenplayer) state.hiddenPlayer = JSON.parse(pref_hiddenplayer);
  },
  [types.GET_PERIOD](state, data) {
    state.period.find(item => item.period === "period_all").games = data
      .map(item => item.game)
      .sort((a, b) => {
        return (
          parseInt(b.match(/\d/g).join(""), 10) -
          parseInt(a.match(/\d/g).join(""), 10)
        );
      });

    state.period = state.period.filter(
      (value, index, self) =>
        self.map(item => item.period).indexOf(value.period) === index
    );

    data
      .map(item => item.year + item.season)
      .filter((value, index, self) => self.indexOf(value) === index)
      .map(item => ({
        period: item,
        games: data
          .filter(sub => sub.year + sub.season === item)
          .map(sub => sub.game)
      }))
      .concat(
        data
          .map(item => item.year)
          .filter((value, index, self) => self.indexOf(value) === index)
          .map(item => ({
            period: `${item}`,
            games: data
              .filter(sub => sub.year === item)
              .map(sub => sub.game)
          }))
      )
      .forEach(item => {
        const find = state.period.find(sub => sub.period === item.period);
        if (!find) {
          state.period.push(item);
        } else {
          find.games = item.games;
        }
      });

    state.period = state.period.sort((a, b) => b.period.localeCompare(a.period));
    if (!state.period.find(item => item.select)) {
      state.period.find(item => item.period === "period_all").select = true;
    }
  },
  [types.GET_PLAYERS](state, data) {
    state.players = data;
  },
  [types.GET_RECORDS](state, data) {
    state.records = data;
  },
  [types.SET_PERIOD](state, data) {
    state.period.forEach(item => {
      item.select = false;
      if (item.period === data) {
        item.select = true;
      }
    });
    const temp = JSON.stringify(state.period);
    state.period = JSON.parse(temp);
    window.localStorage.setItem("pref_period", temp);
  },
  [types.SET_TOP](state, value) {
    state.top = value;
    window.localStorage.setItem("pref_top", state.top);
  },
  [types.SET_UNLIMITED_PA](state, value) {
    state.unlimitedPA = value;
    window.localStorage.setItem("pref_unlimited_pa", state.unlimitedPA);
  },
  [types.SET_SORTBY](state, value) {
    state.sortBy = value;
    window.localStorage.setItem("pref_sortby", state.sortBy);
  },
  [types.SET_CHECKALL](state, isCheckAll) {
    state.cols
      .filter(
        col =>
          col.name !== "Rank" &&
          col.name !== "name" &&
          col.name !== state.sortBy
      )
      .forEach(col => {
        col.visible = isCheckAll;
      });
    window.localStorage.setItem("pref_cols", JSON.stringify(state.cols));
  },
  [types.SET_COLS](state, { col, visible }) {
    const item = state.cols.find(i => i.name === col);
    item.visible = visible || !item.visible;
    window.localStorage.setItem("pref_cols", JSON.stringify(state.cols));
  },
  [types.DEL_PLAYER](state, player) {
    state.hiddenPlayer.push(player);
    window.localStorage.setItem(
      "pref_hiddenplayer",
      JSON.stringify(state.hiddenPlayer)
    );
  },
  [types.REFRESH_PLAYER](state) {
    state.hiddenPlayer = [];
    window.localStorage.setItem(
      "pref_hiddenplayer",
      JSON.stringify(state.hiddenPlayer)
    );
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
    state.gameList = utils.genGameList(data);
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
