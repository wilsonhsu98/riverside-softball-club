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
  teamRequests: state => {
    if (Array.isArray(state.teams)) {
      const find = state.teams.find(
        team => team.teamCode === rootGetters.currentTeam(rootState),
      );
      return find && Array.isArray(find.requests) ? find.requests : [];
    }
    return [];
  },
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
        const batch = db.batch();
        batch.set(
          refPlayerDoc,
          {
            photo,
            custom_photo: url,
            timestamp,
          },
          { merge: true },
        );
        return batch.commit();
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
    let preTeamsContext = '';
    const userId = rootGetters.userId(rootState);
    if (userId) {
      if (typeof snapShot.account === 'function') snapShot.account();
      snapShot.account = db
        .collection('accounts')
        .doc(userId)
        .onSnapshot(snapshot => {
          window.trackRead('fetchUser: accounts', 1);
          const data = snapshot.data();
          if (data) {
            const { accessToken, teams, teamRoles, ...other } = data;
            accessToken;
            teams;
            commit(rootTypes.SET_ACCOUNT_INFO, { ...other });

            // prevent reload teams if teams not changed
            const currentTeamsContext = JSON.stringify(teamRoles);
            if (currentTeamsContext !== preTeamsContext) {
              preTeamsContext = currentTeamsContext;
              if (Object.keys(teamRoles).length) {
                Promise.all(
                  Object.keys(teamRoles).map(teamCode => {
                    return new Promise(resolve => {
                      db.collection('teams')
                        .doc(teamCode)
                        .get()
                        .then(teamsDoc => {
                          resolve({
                            role: teamRoles[teamCode],
                            teamCode: teamCode,
                            ...teamsDoc.data(),
                          });
                        });
                    });
                  }),
                ).then(teams => {
                  window.trackRead(
                    'fetchUser: user belongs teams',
                    teams.length,
                  );
                  commit(
                    types.FETCH_TEAMS,
                    Array.from(teams).sort((a, b) =>
                      b.name.localeCompare(a.name),
                    ),
                  );
                  commit(rootTypes.SET_AUTH, teams);
                  record.actions.workerBox({ commit });
                  teams.forEach(team => {
                    if (typeof snapShotRequest[team.teamCode] === 'function')
                      snapShotRequest[team.teamCode]();
                    if (team.role !== 'manager') return;
                    snapShotRequest[team.teamCode] = db
                      .collection('requests')
                      .where('teamCode', '==', team.teamCode)
                      .onSnapshot(requestsCollection => {
                        window.trackRead(
                          `fetchUser: listen ${team.teamCode} request`,
                          requestsCollection.docs.length || 1,
                        );
                        commit(types.SET_TEAM_REQUEST, {
                          teamCode: team.teamCode,
                          requests: requestsCollection.docs
                            .map(doc => {
                              const { timestamp, ...data } = doc.data();
                              return {
                                timestamp: timestamp.toDate(),
                                ...data,
                                id: doc.id,
                              };
                            })
                            .filter(request => request.status !== 'denied')
                            .sort((a, b) => b.timestamp - a.timestamp),
                        });
                      });
                  });
                });
              } else {
                commit(rootTypes.SET_AUTH);
                commit(types.FETCH_TEAMS);
              }
            }
          }
        });
    }
  },
  switchTeam({ commit, state }, teamCode) {
    window.localStorage.setItem('currentTeam', teamCode);
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
export { types, actions, state };
export default {
  state,
  getters,
  actions,
  mutations,
};
