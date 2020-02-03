import {
  types as rootTypes,
  getters as rootGetters,
  state as rootState,
  promiseImage,
  snapShot,
  snapShotRequest,
} from '../root';
import { types as recordTypes } from './record';
import record from './record';
import router from '../../router';
import { db, timestamp } from '../../firebase';

const types = {
  FETCH_TEAMS: 'TEAM/FETCH_TEAMS',
  SET_TEAM_REQUEST: 'TEAM/SET_TEAM_REQUEST',
};

const state = {
  teams: null, // tricky to set null for the default condition
};

const getters = {
  teams: state => state.teams,
};

const actions = {
  editAvatar({ commit }, data) {
    commit(rootTypes.LOADING, true);
    const refPlayerDoc = db.collection('accounts').doc(data.userId);

    promiseImage(data.custom, 'avatar')
      .then(url => {
        const photo =
          data.current === 'custom'
            ? url
            : data.accountInfo[`${data.current}_photo`];

        return new Promise(resolve => {
          const batch = db.batch();
          batch.update(refPlayerDoc, {
            photo,
            custom_photo: url,
          });
          refPlayerDoc
            .collection('teams')
            .get()
            .then(querySnapshot => querySnapshot.docs.map(doc => doc.id))
            .then(docIds => {
              return Promise.all(
                docIds.map(docId => {
                  return db
                    .collection('teams')
                    .doc(docId)
                    .collection('players')
                    .where('uid', '==', data.userId)
                    .get()
                    .then(querySnapshot => {
                      querySnapshot.forEach(doc => {
                        batch.update(doc.ref, {
                          timestamp,
                        });
                      });
                    });
                }),
              );
            })
            .then(() => {
              resolve(batch.commit());
            });
        });
      })
      .then(() => {
        commit(rootTypes.LOADING, false);
        router.push('/main/user');
      })
      .catch(e => {
        console.log(e);
      });
  },
  fetchUser({ commit }) {
    const userId = rootGetters.userId(rootState);
    if (userId) {
      let queryCount = 0;
      const realtimeCount = 1;
      if (typeof snapShot.account === 'function') snapShot.account();
      snapShot.account = db
        .collection('accounts')
        .doc(userId)
        .onSnapshot(snapshot => {
          const data = snapshot.data();
          if (data) {
            const { accessToken, ...other } = data;
            accessToken;
            queryCount += 1;
            if (queryCount > realtimeCount) {
              // realtime
              commit(rootTypes.LOADING, { text: 'New data is coming' });
              setTimeout(() => {
                commit(rootTypes.SET_ACCOUNT_INFO, { ...other });
                commit(rootTypes.LOADING, false);
              }, 1000);
            } else {
              // first time
              commit(rootTypes.SET_ACCOUNT_INFO, { ...other });
            }
          }
        });
      if (typeof snapShot.teams === 'function') snapShot.teams();
      snapShot.teams = db
        .collection('accounts')
        .doc(userId)
        .collection('teams')
        .onSnapshot(snapshot => {
          if (snapshot.docs.length) {
            Promise.all(
              snapshot.docs.map(doc => {
                return new Promise(resolve => {
                  db.collection('teams')
                    .doc(doc.id)
                    .get()
                    .then(teamsDoc => {
                      resolve({
                        role: doc.data().role,
                        teamCode: doc.id,
                        ...teamsDoc.data(),
                      });
                    });
                });
              }),
            ).then(teams => {
              commit(
                types.FETCH_TEAMS,
                Array.from(teams).sort((a, b) => b.name.localeCompare(a.name)),
              );
              commit(rootTypes.SET_AUTH, teams);
              record.actions.workerBox({ commit });
              teams.forEach(team => {
                if (team.role !== 'manager') return;
                if (typeof snapShotRequest[team.teamCode] === 'function')
                  snapShotRequest[team.teamCode]();
                snapShotRequest[team.teamCode] = db
                  .collection('requests')
                  .where('teamCode', '==', team.teamCode)
                  .onSnapshot(requestsCollection => {
                    commit(types.SET_TEAM_REQUEST, {
                      teamCode: team.teamCode,
                      requests: requestsCollection.docs
                        .map(doc => doc.data())
                        .filter(request => request.status !== 'denied').length,
                    });
                  });
              });
            });
          } else {
            commit(rootTypes.SET_AUTH);
            commit(types.FETCH_TEAMS);
          }
        });
    }
  },
  switchTeam({ commit, state }, teamCode) {
    window.localStorage.setItem('currentTeam', teamCode);
    window.localStorage.removeItem('players');
    window.localStorage.removeItem('period');
    window.localStorage.removeItem('records');
    window.localStorage.removeItem('lastUpdate');
    commit(rootTypes.SET_AUTH, state.teams);
    commit(recordTypes.RESET_PERIOD);
  },
};

const mutations = {
  [types.FETCH_TEAMS](state, data = []) {
    state.teams = data;
  },
  [types.SET_TEAM_REQUEST](state, data) {
    state.teams = state.teams.map(team => {
      if (team.teamCode === data.teamCode) {
        return { ...team, requests: data.requests };
      } else {
        return team;
      }
    });
  },
};
export { types };
export default {
  state,
  getters,
  actions,
  mutations,
};
