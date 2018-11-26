import axios from "axios";
import {
  types as rootTypes
  // getters as rootGetters,
  // state as rootState
} from "../root";
import { GET_URL, TEDDY } from "../../constants/index";
import utils from "../../libs/utils";
import { db, timestamp } from "../../firebase";

const types = {
  GET_WILSON_SHEETS: "IMPORT/GET_WILSON_SHEETS",
  GET_TEDDY_SHEETS: "IMPORT/GET_TEDDY_SHEETS",
  GET_TEDDY_SUMMARY: "IMPORT/GET_TEDDY_SUMMARY",
  SET_TODO: "IMPORT/SET_TODO"
};

const state = {
  wilson_sheets: [],
  teddy_sheets: [],
  teddy_summary: [],
  todo: []
};

const getters = {
  getSourceList: state => {
    return state.teddy_sheets.map(item => ({
      game: item,
      disabled: state.wilson_sheets.indexOf(item) > -1,
      checked:
        state.wilson_sheets.indexOf(item) > -1 || state.todo.indexOf(item) > -1
    }));
  }
};

const actions = {
  fetchTwoOrigin({ commit }, team = "OldStar") {
    commit(rootTypes.LOADING, true);
    Promise.all([
      db
        .collection("teams")
        .doc(team)
        .collection("games")
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.id)),
      axios
        .get(GET_URL({ fileId: TEDDY, action: "sheets" }))
        .then(res => res.data),
      axios
        .get(GET_URL({ fileId: TEDDY, sheetname: "比賽結果" }))
        .then(res => res.data)
    ])
      .then(res => {
        commit(types.GET_WILSON_SHEETS, res[0]);
        commit(types.GET_TEDDY_SHEETS, res[1]);
        commit(types.GET_TEDDY_SUMMARY, res[2]);
        commit(types.SET_TODO);
        commit(rootTypes.LOADING, false);
      })
      .catch(err => {
        alert(err);
        commit(rootTypes.LOADING, false);
      });
  },
  toggleTodo({ commit }, item) {
    commit(types.SET_TODO, item);
  },
  importData({ commit }, team = "OldStar") {
    commit(rootTypes.LOADING, true);
    axios
      .all(
        [].concat(
          axios.get(GET_URL({ fileId: TEDDY, sheetname: "比賽結果" })),
          state.todo.map(table =>
            axios
              .get(
                GET_URL({ action: "2DArray", fileId: TEDDY, sheetname: table })
              )
              .then(res => ({ data: res.data, table }))
          )
        )
      )
      .then(res => {
        const teddySummarys = res.shift().data;
        const batch = db.batch();

        res.forEach(item => {
          const teddySummary = teddySummarys.find(
            game => game["場次"] === item.table
          );
          const parseResult = utils.parseGame(item.data);
          batch.set(
            db
              .collection("teams")
              .doc(team)
              .collection("games")
              .doc(item.table),
            {
              orders: parseResult.orders,
              errors: parseResult.errors,
              result: ["win", "lose", "tie", ""][
                ["勝", "敗", "和", ""].indexOf(
                  teddySummary ? teddySummary["結果"] : 3
                )
              ],
              year: teddySummary ? teddySummary["年度"] : "",
              season: teddySummary ? teddySummary["季度"] : "",
              opponent: teddySummary ? teddySummary["對手"] : "",
              league: teddySummary ? teddySummary["聯盟"] : "",
              group: teddySummary ? teddySummary["組別"] : "",
              timestamp
            }
          );
        });

        return batch.commit();
      })
      .then(() => {
        this.dispatch("fetchTwoOrigin", team);
      })
      .catch(err => {
        alert(err);
        commit(rootTypes.LOADING, false);
      });
  },
  importOneGame({ commit }, team = "OldStar", game) {
    commit(rootTypes.LOADING, true);
    axios
      .all([
        axios.get(GET_URL({ fileId: TEDDY, sheetname: "比賽結果" })),
        axios.get(
          GET_URL({ action: "2DArray", fileId: TEDDY, sheetname: game })
        )
      ])
      .then(res => {
        const teddySummary = res[0].data.find(item => item["場次"] === game);
        const parseResult = utils.parseGame(res[1].data);
        return db
          .collection("teams")
          .doc(team)
          .collection("games")
          .doc(game)
          .set({
            orders: parseResult.orders,
            errors: parseResult.errors,
            result: ["win", "lose", "tie", ""][
              ["勝", "敗", "和", ""].indexOf(
                teddySummary ? teddySummary["結果"] : 3
              )
            ],
            year: teddySummary ? teddySummary["年度"] : "",
            season: teddySummary ? teddySummary["季度"] : "",
            opponent: teddySummary ? teddySummary["對手"] : "",
            league: teddySummary ? teddySummary["聯盟"] : "",
            group: teddySummary ? teddySummary["組別"] : "",
            timestamp
          });
      })
      .then(() => {
        commit(rootTypes.LOADING, false);
      })
      .catch(err => {
        alert(err);
        commit(rootTypes.LOADING, false);
      });
  }
};

const mutations = {
  [types.GET_WILSON_SHEETS](state, data) {
    state.wilson_sheets = data.filter(item => item.match(/\d{8}-\d{1}/g));
  },
  [types.GET_TEDDY_SHEETS](state, data) {
    state.teddy_sheets = data
      .filter(item => item.match(/\d{8}-\d{1}/g))
      .sort((a, b) => {
        return (
          parseInt(b.match(/\d/g).join(""), 10) -
          parseInt(a.match(/\d/g).join(""), 10)
        );
      });
  },
  [types.GET_TEDDY_SUMMARY](state, data) {
    state.teddy_summary = data;
  },
  [types.SET_TODO](state, item) {
    if (item) {
      if (state.todo.indexOf(item) === -1) {
        state.todo.push(item);
      } else {
        state.todo.splice(state.todo.indexOf(item), 1);
      }
    } else {
      state.todo = [];
    }
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
