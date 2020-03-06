import i18n from '../../i18n';
import {
  types as rootTypes,
  // getters as rootGetters,
  // state as rootState,
  promiseImage,
  snapShot,
} from '../root';
import { types as userTypes } from './user';
import { actions as recordActions } from './record';
import { db, auth, fieldValue, timestamp } from '../../firebase';
import router from '../../router';
import { openDB } from 'idb';

const dbInit = teamCode => {
  const tableName = `${teamCode}_games`;
  const version = window.localStorage.getItem('idb') || 1;
  const dbPromise = new Promise(resolve => {
    openDB(process.env.VUE_APP_PROJECTNAME, parseInt(version, 10), {
      blocking(e) {
        // https://stackoverflow.com/questions/43215199/indexeddb-onupgradeneeded-event-never-finishes
        e.target.close();
      },
    })
      .then(db => {
        db.close();
        if (db.objectStoreNames.contains(tableName)) {
          return db.version;
        } else {
          return db.version + 1;
        }
      })
      .then(v => {
        openDB(process.env.VUE_APP_PROJECTNAME, v, {
          upgrade(db, undefined, newVersion) {
            if (!db.objectStoreNames.contains(tableName)) {
              window.localStorage.setItem('idb', newVersion);
              db.createObjectStore(tableName);
            }
          },
          blocking(e) {
            // https://stackoverflow.com/questions/43215199/indexeddb-onupgradeneeded-event-never-finishes
            e.target.close();
          },
        }).then(db => {
          resolve(db);
        });
      });
  });

  return {
    async get(key) {
      return (await dbPromise).get(tableName, key);
    },
    async getAll() {
      return (await dbPromise).getAll(tableName);
    },
    async set(key, val) {
      return (await dbPromise).put(tableName, val, key);
    },
    async delete(key) {
      return (await dbPromise).delete(tableName, key);
    },
    async clear() {
      return (await dbPromise).clear(tableName);
    },
    async keys() {
      return (await dbPromise).getAllKeys(tableName);
    },
  };
};

const types = {
  FETCH_TEAM: 'TEAM/FETCH_TEAM',
  CLEAR_TEAM: 'TEAM/CLEAR_TEAM',
  SEARCH_TEAM: 'TEAM/SEARCH_TEAM',
  FETCH_REQUESTS: 'TEAM/FETCH_REQUESTS',
  FETCH_PHOTO: 'TEAM/FETCH_PHOTO',
  ADD_PHOTO: 'TEAM/ADD_PHOTO',
};

const state = {
  teamInfo: {
    teamCode: '',
    teamName: '',
    teamIntro: '',
    otherNames: '',
    players: [{}],
    benches: [{}],
    icon: '',
    unlockGames: [],
  },
  teamList: [],
  requests: [],
  accountPhotos: {},
};

const getters = {
  teamInfo: state => ({
    ...state.teamInfo,
    players: state.teamInfo.players.map(player => ({
      ...player,
      photo: state.accountPhotos[player.uid],
    })),
    benches: state.teamInfo.benches.map(player => ({
      ...player,
      photo: state.accountPhotos[player.uid],
    })),
  }),
  teamNames: state =>
    [state.teamInfo.teamName].concat(
      state.teamInfo.otherNames.split(',').sort((a, b) => a.localeCompare(b)),
    ),
  teamList: state => state.teamList,
  requests: state => state.requests,
};

const actions = {
  editTeam({ commit }, data) {
    commit(rootTypes.LOADING, true);
    const refTeamDoc = db.collection('teams').doc(data.code);
    const refPlayerDoc = db.collection('accounts').doc(auth.currentUser.uid);
    Promise.all([
      promiseImage(data.icon, 'icon'),
      refTeamDoc.get(),
      refPlayerDoc.get(),
    ])
      .then(res => {
        const [url, teamDoc, playerDoc] = res;
        window.trackRead('editTeam: team doc', 1);
        window.trackRead('editTeam: current player doc', 1);
        if (teamDoc.exists && data.isNew) {
          alert(i18n.t('msg_duplicate_team'));
          return true;
        } else {
          const batch = db.batch();
          data.players.forEach(player => {
            if (player.uid) {
              // set player role
              batch.set(
                db.collection('accounts').doc(player.uid),
                {
                  teamRoles: {
                    [data.code]: player.manager ? 'manager' : 'player',
                  },
                  teams: fieldValue.arrayUnion(data.code),
                },
                { merge: true },
              );
            } else if (player.self) {
              // forced set self role to manager
              batch.set(
                refPlayerDoc,
                {
                  teamRoles: { [data.code]: 'manager' },
                  teams: fieldValue.arrayUnion(data.code),
                },
                { merge: true },
              );
            }
          });
          const players2benches = data.prePlayers
            .filter(prePlayer => {
              if (
                !data.players
                  .map(player => player.name)
                  .includes(prePlayer.name)
              ) {
                // remove from player
                batch.set(
                  refTeamDoc,
                  {
                    players: {
                      [prePlayer.name]: fieldValue.delete(),
                    },
                  },
                  { merge: true },
                );
                if (
                  prePlayer.uid &&
                  !data.players
                    .map(player => player.uid)
                    .includes(prePlayer.uid)
                ) {
                  // change player role to bench
                  batch.set(
                    db.collection('accounts').doc(prePlayer.uid),
                    {
                      teamRoles: {
                        [data.code]: 'bench',
                      },
                      teams: fieldValue.arrayUnion(data.code),
                    },
                    { merge: true },
                  );
                  return true;
                }
              }
            })
            .map(prePlayer => {
              return {
                uid: prePlayer.uid,
                msg: prePlayer.name,
              };
            });
          const benches2players = data.preBenches
            .filter(prePlayer => {
              if (
                !data.benches.map(player => player.uid).includes(prePlayer.uid)
              ) {
                // change player role to bench
                batch.set(
                  db.collection('accounts').doc(prePlayer.uid),
                  {
                    teamRoles: {
                      [data.code]: fieldValue.delete(),
                    },
                    teams: fieldValue.arrayRemove(data.code),
                  },
                  { merge: true },
                );
              } else {
                // change player role to player
                batch.set(
                  db.collection('accounts').doc(prePlayer.uid),
                  {
                    teamRoles: {
                      [data.code]: 'player',
                    },
                    teams: fieldValue.arrayUnion(data.code),
                  },
                  { merge: true },
                );
                // remove from bench
                batch.set(
                  refTeamDoc,
                  {
                    benches: {
                      [prePlayer.uid]: fieldValue.delete(),
                    },
                  },
                  { merge: true },
                );
                return data.benches.find(
                  player => player.name && player.uid === prePlayer.uid,
                );
              }
            })
            .map(prePlayer => {
              const find = data.benches.find(
                player => player.uid === prePlayer.uid,
              );
              return {
                manager: false,
                number: find.number,
                uid: find.uid,
                name: find.name,
              };
            });
          const players = [...data.players, ...benches2players].reduce(
            (acc, player) => {
              const { name, number = '', manager, uid } = player;
              acc[name] = {
                number,
                manager,
                ...((uid || player.self) && {
                  uid: player.self ? playerDoc.id : uid,
                }),
              };
              return acc;
            },
            {},
          );
          const benches = [
            ...data.benches.filter(player => !player.name),
            ...players2benches,
          ].reduce((acc, player) => {
            const { msg, uid } = player;
            acc[uid] = { msg, uid };
            return acc;
          }, {});
          batch.set(
            refTeamDoc,
            {
              name: data.name,
              subNames: data.subNames,
              intro: data.intro,
              icon: url,
              players,
              benches,
              timestamp,
            },
            { merge: true },
          );
          return batch.commit();
        }
      })
      .then(() => {
        if (data.isNew) {
          router.push('/main/user');
        }
        commit(rootTypes.LOADING, false);
      })
      .catch(error => {
        console.log('Error getting document:', error);
      });
  },
  deleteTeam({ commit }, teamCode) {
    // remove role & team (player bench manager), remove team, deny team request
    commit(rootTypes.LOADING, true);
    Promise.all([
      db
        .collection('accounts')
        .where('teams', 'array-contains', teamCode)
        .get(),
      db
        .collection('requests')
        .where('teamCode', '==', teamCode)
        .get(),
    ])
      .then(res => {
        const [accountCollection, requestCollection] = res;
        window.trackRead(
          'fetchTeamInfo: accounts in the team',
          accountCollection.docs.length || 1,
        );
        window.trackRead(
          'fetchTeamInfo: request join the team',
          requestCollection.docs.length || 1,
        );
        const batch = db.batch();
        accountCollection.docs.forEach(doc => {
          batch.set(
            doc.ref,
            {
              teamRoles: {
                [teamCode]: fieldValue.delete(),
              },
              teams: fieldValue.arrayRemove(teamCode),
            },
            { merge: true },
          );
        });
        requestCollection.docs.forEach(doc => {
          batch.set(
            doc.ref,
            {
              status: 'denied',
              timestamp,
            },
            { merge: true },
          );
        });
        batch.delete(db.collection('teams').doc(teamCode));
        return batch.commit();
      })
      .then(() => {
        router.push('/main/user');
        commit(rootTypes.LOADING, false);
      })
      .catch(error => {
        console.log('Error getting document:', error);
      });
  },
  fetchTeamInfo({ commit }, teamCode) {
    commit(types.CLEAR_TEAM);
    commit(rootTypes.LOADING, true);
    Promise.all([
      db
        .collection('teams')
        .doc(teamCode)
        .get(),
      db
        .collection('accounts')
        .where('teams', 'array-contains', teamCode)
        .get(),
    ]).then(res => {
      const [teamDoc, accountCollection] = res;
      window.trackRead('fetchTeamInfo: team', 1);
      window.trackRead(
        'fetchTeamInfo: accounts in the team',
        accountCollection.docs.length || 1,
      );
      if (teamDoc.exists) {
        const {
          benches: benches_ = {},
          players: players_ = {},
          ...others
        } = teamDoc.data();
        const players = Object.keys(players_).map(name => ({
          name,
          manager: players_[name].manager,
          number: players_[name].number,
          uid: players_[name].uid,
        }));
        const benches = Object.keys(benches_).map(uid => ({
          uid,
          msg: benches_[uid].msg,
        }));
        commit(types.FETCH_TEAM, {
          id: teamDoc.id,
          players,
          benches,
          ...others,
        });
        commit(types.FETCH_PHOTO, accountCollection);
      }
      commit(rootTypes.LOADING, false);
    });
  },
  listenTeamChange({ commit }, teamCode) {
    let prePlayersContext = '';
    let preUnlockGames;
    if (teamCode) {
      const idbKeyval = dbInit(teamCode);
      if (typeof snapShot.team === 'function') snapShot.team();
      snapShot.team = db
        .collection('teams')
        .doc(teamCode)
        .onSnapshot(teamDoc => {
          if (teamDoc.exists) {
            window.trackRead('listenTeamChange: team', 1);
            const {
              icon,
              games = {},
              benches: benches_ = {},
              players: players_ = {},
              unlockGames = [],
              ...others
            } = teamDoc.data();
            commit(rootTypes.SET_TEAMICON, icon);

            if (
              preUnlockGames === undefined ||
              JSON.stringify(preUnlockGames) === JSON.stringify(unlockGames)
            ) {
              // prevent reload players if players not changed
              const currentPlayersContext = JSON.stringify(players_);
              if (currentPlayersContext !== prePlayersContext) {
                prePlayersContext = currentPlayersContext;
                recordActions.operatePlayers(
                  { commit },
                  {
                    teamCode,
                    players: Object.keys(players_).map(name => ({
                      id: name,
                      data: players_[name],
                    })),
                  },
                );
              }

              idbKeyval.getAll().then(localGames => {
                const localIds = localGames.map(game => game.id);
                const gameShouldUpdates = localGames
                  .filter(
                    game =>
                      games[game.id] && !games[game.id].isEqual(game.timestamp),
                  )
                  .map(game => game.id)
                  .concat(
                    Object.keys(games).filter(game => !localIds.includes(game)),
                  );

                // delete
                const gameShouldDeletes = localGames
                  .filter(game => !Object.keys(games).includes(game.id))
                  .map(game => game.id);

                // update if needed
                Promise.all(
                  gameShouldUpdates.map(game =>
                    db.doc(`teams/${teamCode}/games/${game}`).get(),
                  ),
                ).then(gameDocs => {
                  window.trackRead(
                    'listenTeamChange: games need to update',
                    gameDocs.length,
                  );
                  const setGames = gameDocs.map(gameDoc => {
                    return idbKeyval.set(gameDoc.id, {
                      id: gameDoc.id,
                      ...gameDoc.data(),
                    });
                  });
                  const delGames = gameShouldDeletes.map(gameId => {
                    return idbKeyval.delete(gameId);
                  });
                  Promise.all([...setGames, ...delGames])
                    .then(() => idbKeyval.getAll())
                    .then(records => {
                      recordActions.operateGames(
                        { commit },
                        records.map(({ id, ...data }) => ({
                          id,
                          data: { ...data },
                        })),
                      );
                    });
                });
              });
            }
            preUnlockGames = unlockGames;
            const players = Object.keys(players_).map(name => ({
              name,
              manager: players_[name].manager,
              number: players_[name].number,
              uid: players_[name].uid,
            }));
            const benches = Object.keys(benches_).map(uid => ({
              uid,
              msg: benches_[uid].msg,
            }));
            commit(types.FETCH_TEAM, {
              id: teamDoc.id,
              icon,
              players,
              benches,
              games,
              unlockGames,
              ...others,
            });
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
        window.trackRead('searchTeams', teamCollection.docs.length || 1);
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
            if (['*', '＊'].includes(keyword)) return true;
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
  fetchPersonalRequests({ commit }, uid) {
    commit(rootTypes.LOADING, true);
    if (typeof snapShot.request === 'function') snapShot.request();
    snapShot.request = db
      .collection('requests')
      .where('uid', '==', uid)
      .onSnapshot(querySnapshot => {
        window.trackRead(
          'fetchPersonalRequests',
          querySnapshot.docs.length || 1,
        );
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
      });
  },
  disconnectPersonalRequests() {
    if (typeof snapShot.request === 'function') snapShot.request();
  },
  handleRequest({ commit }, { requestId, action }) {
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
          window.trackRead('handleRequest: accept', 1);
          const data = request.data();
          const batch = db.batch();
          if (data.name) {
            batch.set(
              db.collection('accounts').doc(data.uid),
              {
                teamRoles: {
                  [data.teamCode]: 'player',
                },
                teams: fieldValue.arrayUnion(data.teamCode),
              },
              { merge: true },
            );
            batch.set(
              db.collection('teams').doc(data.teamCode),
              {
                players: {
                  [data.name]: {
                    uid: data.uid,
                  },
                },
              },
              { merge: true },
            );
          } else {
            batch.set(
              db.collection('accounts').doc(data.uid),
              {
                teamRoles: {
                  [data.teamCode]: 'bench',
                },
                teams: fieldValue.arrayUnion(data.teamCode),
              },
              { merge: true },
            );
            batch.set(
              db.collection('teams').doc(data.teamCode),
              {
                benches: {
                  [data.uid]: {
                    uid: data.uid,
                    msg: data.msg,
                  },
                },
              },
              { merge: true },
            );
          }
          commit(types.ADD_PHOTO, {
            uid: data.uid,
            photo: data.photo,
          });
          batch.delete(refRequestDoc);
          batch.commit();
        });
        break;
    }
  },
};

const mutations = {
  [types.CLEAR_TEAM](state) {
    state.teamInfo = {
      teamCode: '',
      teamName: '',
      teamIntro: '',
      otherNames: '',
      players: [{}],
      benches: [{}],
      icon: '',
    };
  },
  [types.FETCH_TEAM](state, data) {
    state.teamInfo = {
      teamCode: data.id,
      teamName: data.name,
      teamIntro: data.intro,
      otherNames: data.subNames,
      players: [...data.players].sort((a, b) => a.number - b.number),
      benches: [...data.benches].sort((a, b) => a.number - b.number),
      icon: data.icon,
      unlockGames: [...(data.unlockGames || [])],
    };
  },
  [types.FETCH_PHOTO](state, accountCollection) {
    state.accountPhotos = accountCollection.docs.reduce(
      (acc, doc) => {
        acc[doc.id] = doc.data().photo;
        return acc;
      },
      { ...state.accountPhotos },
    );
  },
  [types.ADD_PHOTO](state, { uid, photo }) {
    state.accountPhotos = {
      ...state.accountPhotos,
      [uid]: photo,
    };
  },
  [types.SEARCH_TEAM](state, data) {
    state.teamList = data;
  },
  [types.FETCH_REQUESTS](state, data) {
    state.requests = data;
  },
};

export { types };
export default {
  state,
  getters,
  actions,
  mutations,
};
