import i18n from '../../i18n';
import {
  types as rootTypes,
  // getters as rootGetters,
  // state as rootState,
  promiseImage,
} from '../root';
import { types as userTypes } from './user';
import { db, auth, timestamp, fieldValue } from '../../firebase';

let snapShotTeam;
let snapShotRequest;
let snapShotTeamRequest;

const types = {
  FETCH_TEAM: 'TEAM/FETCH_TEAM',
  SEARCH_TEAM: 'TEAM/SEARCH_TEAM',
  FETCH_REQUESTS: 'TEAM/FETCH_REQUESTS',
  FETCH_TEAM_REQUESTS: 'TEAM/FETCH_TEAM_REQUESTS',
};

const state = {
  teamInfo: {
    teamCode: '',
    teamName: '',
    teamIntro: '',
    otherNames: '',
    players: [{}],
    icon: '',
  },
  teamList: [],
  requests: [],
  teamRequests: [],
};

const getters = {
  teamInfo: state => state.teamInfo,
  teamList: state => state.teamList,
  requests: state => state.requests,
  teamRequests: state => state.teamRequests,
};

const actions = {
  editTeam({ commit, dispatch }, data) {
    commit(rootTypes.LOADING, true);
    const refTeamDoc = db.collection('teams').doc(data.code);
    const refPlayerDoc = db.collection('accounts').doc(auth.currentUser.uid);
    Promise.all([
      promiseImage(data.icon, 'icon'),
      refTeamDoc.get(),
      refTeamDoc.collection('players').get(),
      refTeamDoc.collection('benches').get(),
      refPlayerDoc.get(),
    ])
      .then(res => {
        const [
          url,
          teamDoc,
          teamPlayerCollection,
          teamBenchesCollection,
          playerDoc,
        ] = res;
        if (teamDoc.exists && data.isNew) {
          alert(i18n.t('msg_duplicate_team'));
          return true;
        } else {
          const batch = db.batch();
          batch.set(
            refTeamDoc,
            {
              name: data.name,
              subNames: data.subNames,
              intro: data.intro,
              icon: url,
              timestamp,
            },
            { merge: true },
          );
          data.players.forEach(item => {
            if (item.uid) {
              batch.set(
                db
                  .collection('accounts')
                  .doc(item.uid)
                  .collection('teams')
                  .doc(data.code),
                { role: item.manager ? 'manager' : 'player' },
                { merge: true },
              );
            } else if (item.self) {
              batch.set(
                refPlayerDoc.collection('teams').doc(data.code),
                { role: 'manager' },
                { merge: true },
              );
              batch.set(
                refPlayerDoc,
                { teams: fieldValue.arrayUnion(data.code) },
                { merge: true },
              );
            }
            batch.set(
              refTeamDoc.collection('players').doc(item.name),
              {
                number: item.number,
                manager: item.manager,
                ...(item.uid
                  ? { uid: item.uid }
                  : item.self
                  ? { uid: playerDoc.id }
                  : {}),
              },
              {
                merge: true,
              },
            );
          });
          teamPlayerCollection.docs.forEach(doc => {
            if (!data.players.map(player => player.name).includes(doc.id)) {
              batch.delete(refTeamDoc.collection('players').doc(doc.id));
              const { uid } = doc.data();
              if (
                uid &&
                !data.players.map(player => player.uid).includes(uid)
              ) {
                batch.set(
                  db
                    .collection('accounts')
                    .doc(uid)
                    .collection('teams')
                    .doc(data.code),
                  { role: 'bench' },
                  { merge: true },
                );
                batch.set(
                  refTeamDoc.collection('benches').doc(uid),
                  { uid, msg: doc.id },
                  { merge: true },
                );
              }
            }
          });
          data.benches
            .filter(item => item.name)
            .forEach(item => {
              batch.set(
                db
                  .collection('accounts')
                  .doc(item.uid)
                  .collection('teams')
                  .doc(data.code),
                { role: 'player' },
                { merge: true },
              );
              batch.set(
                db.collection('accounts').doc(item.uid),
                { teams: fieldValue.arrayUnion(data.code) },
                { merge: true },
              );
              batch.set(
                refTeamDoc.collection('players').doc(item.name),
                { manager: false, number: item.number || '', uid: item.uid },
                { merge: true },
              );
              batch.delete(refTeamDoc.collection('benches').doc(item.uid));
            });
          teamBenchesCollection.docs.forEach(doc => {
            if (!data.benches.map(player => player.uid).includes(doc.id)) {
              batch.delete(refTeamDoc.collection('benches').doc(doc.id));
              batch.delete(
                db
                  .collection('accounts')
                  .doc(doc.id)
                  .collection('teams')
                  .doc(data.code),
              );
              batch.set(
                db.collection('accounts').doc(doc.id),
                { teams: fieldValue.arrayRemove(data.code) },
                { merge: true },
              );
            }
          });
          return batch.commit();
        }
      })
      .then(() => {
        commit(rootTypes.LOADING, false);
        dispatch('fetchTeamInfo', data.code);
      })
      .catch(error => {
        console.log('Error getting document:', error);
      });
  },
  fetchTeamInfo({ commit }, teamCode) {
    commit(rootTypes.LOADING, true);
    const refTeamDoc = db.collection('teams').doc(teamCode);
    Promise.all([
      refTeamDoc.get(),
      refTeamDoc.collection('players').get(),
      refTeamDoc.collection('benches').get(),
      db
        .collection('accounts')
        .where('teams', 'array-contains', teamCode)
        .get(),
    ]).then(res => {
      const [
        teamDoc,
        playerCollection,
        benchCollection,
        accountCollection,
      ] = res;
      if (teamDoc.exists) {
        const players = playerCollection.docs.map(doc => {
          const data = doc.data();
          const find = accountCollection.docs.find(
            account => account.id === data.uid,
          );
          return {
            name: doc.id,
            photo: find && find.data().photo,
            ...data,
          };
        });
        const benches = benchCollection.docs.map(doc => {
          const data = doc.data();
          const find = accountCollection.docs.find(
            account => account.id === data.uid,
          );
          return {
            photo: find && find.data().photo,
            ...data,
          };
        });
        commit(types.FETCH_TEAM, {
          id: teamDoc.id,
          ...teamDoc.data(),
          players,
          benches,
        });
      }
      commit(rootTypes.LOADING, false);
    });
  },
  fetchTeamIcon({ commit }, teamCode) {
    if (teamCode) {
      commit(rootTypes.LOADING, true);

      const refTeamDoc = db.collection('teams').doc(teamCode);
      let queryCount = 0;
      const realtimeCount = 1;
      if (typeof snapShotTeam === 'function') snapShotTeam();
      snapShotTeam = refTeamDoc.onSnapshot(doc => {
        queryCount += 1;
        if (queryCount > realtimeCount) {
          // realtime
          commit(rootTypes.LOADING, { text: 'New data is coming' });
          setTimeout(() => {
            if (doc.exists) {
              commit(rootTypes.SET_TEAMICON, doc.data().icon);
            }
            commit(rootTypes.LOADING, false);
          }, 1000);
        } else {
          // first time
          if (doc.exists) {
            commit(rootTypes.SET_TEAMICON, doc.data().icon);
          }
          if (queryCount === realtimeCount) {
            commit(rootTypes.LOADING, false);
          }
        }
      });
    } else {
      commit(rootTypes.SET_TEAMICON, '');
    }
  },
  searchTeams({ commit }, { keyword = '', type }) {
    if (!keyword) {
      switch (type) {
        case 'join':
          commit(types.SEARCH_TEAM, []);
          break;
        case 'anonymous':
          commit(userTypes.FETCH_TEAMS, []);
          break;
      }
      return;
    }
    commit(rootTypes.LOADING, true);
    db.collection('teams')
      .get()
      .then(teamCollection => {
        const filterTeams = teamCollection.docs
          .map(doc => {
            const data = doc.data();
            return {
              teamCode: doc.id,
              icon: data.icon,
              name: data.name,
              subNames: data.subNames,
              keyword: `${data.name}${
                data.subNames ? `${data.subNames.replace(/,/g, '')}` : ''
              }`,
            };
          })
          .filter(team => {
            if (keyword === '*') return true;
            return keyword
              ? team.keyword.match(
                  new RegExp(
                    keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                    'ig',
                  ),
                )
              : false;
          })
          .sort((a, b) => b.name.localeCompare(a.name));

        switch (type) {
          case 'join':
            commit(types.SEARCH_TEAM, filterTeams);
            break;
          case 'anonymous':
            commit(userTypes.FETCH_TEAMS, filterTeams);
            break;
        }
        commit(rootTypes.LOADING, false);
      });
  },
  requestJoin({ commit }, data) {
    commit(rootTypes.LOADING, true);
    const batch = db.batch();
    batch.set(
      db.collection('requests').doc(`${data.teamCode}-${data.uid}`),
      { ...data, status: '', timestamp },
      { merge: true },
    );
    batch
      .commit()
      .then(() => {
        commit(rootTypes.LOADING, false);
        // dispatch("fetchRequests", data.uid);
      })
      .catch(error => {
        console.log('Error getting document:', error);
      });
  },
  fetchRequests({ commit }, uid) {
    commit(rootTypes.LOADING, true);
    if (typeof snapShotRequest === 'function') snapShotRequest();
    snapShotRequest = db
      .collection('requests')
      .where('uid', '==', uid)
      .onSnapshot(querySnapshot => {
        if (!querySnapshot.metadata.hasPendingWrites) {
          const requests = querySnapshot.docs
            .map(doc => {
              const { timestamp, ...data } = doc.data();
              return {
                timestamp: timestamp.toDate(),
                ...data,
                id: doc.id,
              };
            })
            .sort((a, b) => b.timestamp - a.timestamp);
          commit(types.FETCH_REQUESTS, requests);
          commit(rootTypes.LOADING, false);
        }
      });
  },
  disconnectRequests() {
    if (typeof snapShotRequest === 'function') snapShotRequest();
  },
  fetchTeamRequests({ commit }, teamCode) {
    if (teamCode) {
      commit(rootTypes.LOADING, true);
      const operateRequests = requests => {
        Promise.all(
          requests
            .filter(request => request.status !== 'denied')
            .map(request => {
              return db
                .collection('accounts')
                .doc(request.uid)
                .get()
                .then(doc => {
                  return {
                    ...request,
                    photo: doc.data().photo,
                  };
                });
            }),
        ).then(res => {
          commit(types.FETCH_TEAM_REQUESTS, res);
        });
      };

      if (typeof snapShotTeamRequest === 'function') snapShotTeamRequest();
      snapShotTeamRequest = db
        .collection('requests')
        .where('teamCode', '==', teamCode)
        .onSnapshot(querySnapshot => {
          if (!querySnapshot.metadata.hasPendingWrites) {
            const requests = querySnapshot.docs
              .map(doc => {
                const { timestamp, ...data } = doc.data();
                return {
                  timestamp: timestamp.toDate(),
                  ...data,
                  id: doc.id,
                };
              })
              .sort((a, b) => b.timestamp - a.timestamp);

            operateRequests(requests);
            commit(rootTypes.LOADING, false);
          }
        });
    }
  },
  handleRequest({ dispatch }, { requestId, action }) {
    const refRequestDoc = db.collection('requests').doc(requestId);
    switch (action) {
      case 'denied':
        refRequestDoc.set({ status: 'denied', timestamp }, { merge: true });
        break;
      case 'delete':
        refRequestDoc.delete();
        break;
      case 'accept':
        refRequestDoc.get().then(request => {
          const data = request.data();
          const batch = db.batch();
          if (data.name) {
            batch.set(
              db
                .collection('accounts')
                .doc(data.uid)
                .collection('teams')
                .doc(data.teamCode),
              { role: 'player' },
              { merge: true },
            );
            batch.set(
              db.collection('accounts').doc(data.uid),
              { teams: fieldValue.arrayUnion(data.teamCode) },
              { merge: true },
            );
            batch.set(
              db
                .collection('teams')
                .doc(data.teamCode)
                .collection('players')
                .doc(data.name),
              { uid: data.uid },
              { merge: true },
            );
          } else {
            batch.set(
              db
                .collection('accounts')
                .doc(data.uid)
                .collection('teams')
                .doc(data.teamCode),
              { role: 'bench' },
              { merge: true },
            );
            batch.set(
              db.collection('accounts').doc(data.uid),
              { teams: fieldValue.arrayUnion(data.teamCode) },
              { merge: true },
            );
            batch.set(
              db
                .collection('teams')
                .doc(data.teamCode)
                .collection('benches')
                .doc(data.uid),
              { uid: data.uid, msg: data.msg },
              { merge: true },
            );
          }
          batch.delete(refRequestDoc);
          batch.commit().then(() => {
            dispatch('fetchTeamInfo', data.teamCode);
          });
        });
        break;
    }
  },
};

const mutations = {
  [types.FETCH_TEAM](state, data) {
    state.teamInfo = {
      teamCode: data.id,
      teamName: data.name,
      teamIntro: data.intro,
      otherNames: data.subNames,
      players: Array.from(data.players).sort((a, b) => a.number - b.number),
      benches: data.benches,
      icon: data.icon,
    };
  },
  [types.SEARCH_TEAM](state, data) {
    state.teamList = data;
  },
  [types.FETCH_REQUESTS](state, data) {
    state.requests = data;
  },
  [types.FETCH_TEAM_REQUESTS](state, data) {
    state.teamRequests = data;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
