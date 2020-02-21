import axios from 'axios';
import {
  types as rootTypes,
  // getters as rootGetters,
  // state as rootState
} from '../root';
import { GET_URL, TEDDY } from '../../constants/index';
import utils from '../../libs/utils';
import { db, timestamp } from '../../firebase';

const types = {
  GET_WILSON_SHEETS: 'IMPORT/GET_WILSON_SHEETS',
  GET_TEDDY_SHEETS: 'IMPORT/GET_TEDDY_SHEETS',
  GET_TEDDY_SUMMARY: 'IMPORT/GET_TEDDY_SUMMARY',
  SET_TODO: 'IMPORT/SET_TODO',
  SET_DONE: 'IMPORT/SET_DONE',
  SET_CURRENT_HANDEL: 'IMPORT/SET_CURRENT_HANDEL',
};

const state = {
  wilson_sheets: [],
  teddy_sheets: [],
  teddy_summary: [],
  todo: [],
  done: [],
  current_handel: '',
};

const getters = {
  getSourceList: state => {
    return state.teddy_sheets.map(item => ({
      game: item,
      disabled: state.wilson_sheets.indexOf(item) > -1,
      checked:
        state.wilson_sheets.indexOf(item) > -1 || state.todo.indexOf(item) > -1,
    }));
  },
  todo: state => state.todo,
  done: state => state.done,
  current_handel: state => state.current_handel,
};

const actions = {
  fetchTwoOrigin({ commit }, team = 'OldStar') {
    commit(rootTypes.LOADING, true);
    Promise.all([
      db
        .collection('teams')
        .doc(team)
        .collection('games')
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.id)),
      axios
        .get(GET_URL({ fileId: TEDDY, action: 'sheets' }))
        .then(res => res.data),
      axios
        .get(GET_URL({ fileId: TEDDY, sheetname: '比賽結果' }))
        .then(res => res.data),
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
  importData({ commit, dispatch }, team = 'OldStar') {
    commit(rootTypes.LOADING, true);
    axios
      .all(
        [].concat(
          axios.get(GET_URL({ fileId: TEDDY, sheetname: '比賽結果' })),
          state.todo.map(table =>
            axios
              .get(
                GET_URL({ action: '2DArray', fileId: TEDDY, sheetname: table }),
              )
              .then(res => ({ data: res.data, table })),
          ),
        ),
      )
      .then(res => {
        const teddySummarys = res[0].data;
        const batch = db.batch();

        res.slice(1).forEach(item => {
          const teddySummary = teddySummarys.find(
            game => game['場次'] === item.table,
          );
          const parseResult = utils.parseGame(item.data);
          batch.set(
            db
              .collection('teams')
              .doc(team)
              .collection('games')
              .doc(item.table),
            {
              version: 'import',
              orders: parseResult.orders,
              errors: parseResult.errors,
              result: ['win', 'lose', 'tie', ''][
                ['勝', '敗', '和', ''].indexOf(
                  teddySummary ? teddySummary['結果'] : '',
                )
              ],
              period: teddySummary
                ? `${teddySummary['年度']}${teddySummary['季度']}`
                : '',
              gameType: teddySummary
                ? teddySummary['季度'].indexOf('季後') > -1
                  ? 'playoff'
                  : 'regular'
                : '',
              opponent: teddySummary ? teddySummary['對手'] : '',
              league: teddySummary ? teddySummary['聯盟'] : '',
              coach: teddySummary ? teddySummary['教練'] : '',
              place:
                ['', '一', '二', '三'].indexOf(
                  teddySummary ? teddySummary['休息區'] : '',
                ) || '',
              group: teddySummary ? teddySummary['組別'] : '',
              useTeam: [
                'TrendMicro',
                'TrendMicro',
                'TrendMicro',
                '趨勢科技',
                '趨勢科技',
                '趨勢科技',
                '',
              ][
                ['B', 'C', 'D', 'E', 'F', 'G', ''].indexOf(
                  teddySummary ? teddySummary['組別'] : '',
                )
              ],
              timestamp,
            },
            { merge: true },
          );
        });

        return batch.commit();
      })
      .then(() => {
        dispatch('fetchTwoOrigin', team);
      })
      .catch(err => {
        alert(err);
        commit(rootTypes.LOADING, false);
      });
  },
  importOneGame({ commit }, { team = 'OldStar', game }) {
    commit(rootTypes.LOADING, true);
    return axios
      .all([
        axios.get(GET_URL({ fileId: TEDDY, sheetname: '比賽結果' })),
        axios.get(
          GET_URL({ action: '2DArray', fileId: TEDDY, sheetname: game }),
        ),
      ])
      .then(res => {
        const teddySummary = res[0].data.find(item => item['場次'] === game);
        const parseResult = utils.parseGame(res[1].data);
        return db
          .collection('teams')
          .doc(team)
          .collection('games')
          .doc(game)
          .set(
            {
              version: 'import',
              orders: parseResult.orders,
              errors: parseResult.errors,
              result: ['win', 'lose', 'tie', ''][
                ['勝', '敗', '和', ''].indexOf(
                  teddySummary ? teddySummary['結果'] : '',
                )
              ],
              period: teddySummary
                ? `${teddySummary['年度']}${teddySummary['季度']}`
                : '',
              gameType: teddySummary
                ? teddySummary['季度'].indexOf('季後') > -1
                  ? 'playoff'
                  : 'regular'
                : '',
              opponent: teddySummary ? teddySummary['對手'] : '',
              league: teddySummary ? teddySummary['聯盟'] : '',
              coach: teddySummary ? teddySummary['教練'] : '',
              place:
                ['', '一', '二', '三'].indexOf(
                  teddySummary ? teddySummary['休息區'] : '',
                ) || '',
              group: teddySummary ? teddySummary['組別'] : '',
              useTeam: [
                'TrendMicro',
                'TrendMicro',
                'TrendMicro',
                '趨勢科技',
                '趨勢科技',
                '趨勢科技',
                '',
              ][
                ['B', 'C', 'D', 'E', 'F', 'G', ''].indexOf(
                  teddySummary ? teddySummary['組別'] : '',
                )
              ],
              timestamp,
            },
            { merge: true },
          );
      })
      .then(() => {
        commit(rootTypes.LOADING, false);
      })
      .catch(err => {
        console.log(err);
        commit(rootTypes.LOADING, false);
      });
  },
  migrateAll({ commit, dispatch }, { team = 'OldStar', games = [] }) {
    commit(types.SET_DONE);
    games.reduce((acc, game) => {
      return acc
        .then(() => {
          return dispatch('importOneGame', { team, game });
        })
        .then(() => {
          commit(types.SET_CURRENT_HANDEL, game);
          commit(types.SET_DONE, game);
        });
    }, Promise.resolve());
  },

  migrateGamesTimeToTeamDoc(undefined, team = 'OldStar') {
    db.collection(`teams/${team}/games`)
      .get()
      .then(collection =>
        Promise.all(
          collection.docs.map(doc => ({
            id: doc.id,
            data: doc.data(),
          })),
        ),
      )
      .then(arr => {
        const games = arr.reduce((acc, item) => {
          acc[item.id] = item.data.timestamp;
          return acc;
        }, {});
        db.collection('teams')
          .doc(team)
          .set({ games }, { merge: true });
      });
  },
  migratePlayersToTeamDoc(undefined, team = 'OldStar') {
    db.collection(`teams/${team}/players`)
      .get()
      .then(collection =>
        Promise.all(
          collection.docs.map(doc => ({
            id: doc.id,
            data: doc.data(),
          })),
        ),
      )
      .then(arr => {
        const players = arr.reduce((acc, item) => {
          acc[item.id] = { ...item.data };
          return acc;
        }, {});
        db.collection('teams')
          .doc(team)
          .set({ players }, { merge: true });
      });
  },
  migrateBenchesToTeamDoc(undefined, team = 'OldStar') {
    db.collection(`teams/${team}/benches`)
      .get()
      .then(collection =>
        Promise.all(
          collection.docs.map(doc => ({
            id: doc.id,
            data: doc.data(),
          })),
        ),
      )
      .then(arr => {
        const benches = arr.reduce((acc, item) => {
          acc[item.id] = { ...item.data };
          return acc;
        }, {});
        db.collection('teams')
          .doc(team)
          .set({ benches }, { merge: true });
      });
  },
  migrateTeamRoleToAccountDoc() {
    db.collection('accounts')
      .get()
      .then(accounts => {
        return Promise.all(
          accounts.docs.map(account =>
            db.collection(`accounts/${account.id}/teams`).get(),
          ),
        );
      })
      .then(accountTeams => {
        return Promise.all(
          accountTeams
            .filter(accountTeam => {
              return accountTeam.docs.length;
            })
            .map(accountTeam => {
              return accountTeam.docs.map(doc => {
                return {
                  uid: accountTeam.docs[0].ref.parent.parent.id,
                  id: doc.id,
                  ...doc.data(),
                };
              });
            }),
        );
      })
      .then(accounts => {
        accounts.forEach(accountTeams => {
          const teamObj = accountTeams.reduce((acc, team) => {
            acc[team.id] = team.role;
            return acc;
          }, {});
          db.collection('accounts')
            .doc(accountTeams[0].uid)
            .set(
              { teams: Object.keys(teamObj), teamRoles: teamObj },
              { merge: true },
            );
        });
      });
  },
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
          parseInt(b.match(/\d/g).join(''), 10) -
          parseInt(a.match(/\d/g).join(''), 10)
        );
      });
  },
  [types.GET_TEDDY_SUMMARY](state, data) {
    state.teddy_summary = data;
  },
  [types.SET_TODO](state, item) {
    if (item) {
      if (state.todo.indexOf(item) === -1) {
        state.todo = Array.from(state.todo).concat([item]);
      } else {
        state.todo = [
          ...state.todo.slice(0, state.todo.indexOf(item)),
          ...state.todo.slice(state.todo.indexOf(item) + 1),
        ];
      }
    } else {
      state.todo = [];
    }
  },
  [types.SET_DONE](state, item) {
    if (item) {
      if (state.done.indexOf(item) === -1) {
        state.done = Array.from(state.done).concat([item]);
      } else {
        state.done = [
          ...state.done.slice(0, state.done.indexOf(item)),
          ...state.done.slice(state.done.indexOf(item) + 1),
        ];
      }
    } else {
      state.done = [];
    }
  },
  [types.SET_CURRENT_HANDEL](state, item) {
    state.current_handel = item;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
