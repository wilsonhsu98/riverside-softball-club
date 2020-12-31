import i18n from '../../i18n';
import {
  types as rootTypes,
  actions as rootActions,
  // getters as rootGetters,
  // state as rootState,
  promiseImage,
  snapShot,
} from '../root';
import { types as userTypes } from './user';
import { actions as recordActions, types as recordTypes } from './record';
import { db, auth, fieldValue, timestamp } from '../../firebase';
import router from '../../router';
import { evaluateTeamScore, formatDate } from '../../libs/utils';
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
  FETCH_DEMO_TEAM: 'TEAM/FETCH_DEMO_TEAM',
  CLEAR_TEAM: 'TEAM/CLEAR_TEAM',
  SET_KEYWORD: 'TEAM/SET_KEYWORD',
  SEARCH_TEAM: 'TEAM/SEARCH_TEAM',
  SEARCH_RECENT_GAMES: 'TEAM/SEARCH_RECENT_GAMES',
  SEARCH_ALL_TEAM: 'TEAM/SEARCH_ALL_TEAM',
  FETCH_REQUESTS: 'TEAM/FETCH_REQUESTS',
  CACHE_TEAMS: 'TEAM/CACHE_TEAMS',
};

const state = {
  teamInfo: {
    teamCode: '',
    teamName: '',
    teamIntro: '',
    otherNames: '',
    score: undefined,
    scoreKVP: {},
    players: [{}],
    benches: [{}],
    icon: '',
    unlockGames: [],
  },
  demoTeam: undefined,
  keyword: '',
  teamList: [],
  recentGames: [],
  allTeams: [],
  requests: [],
  cacheTeamsResponse: undefined,
};

const getters = {
  teamInfo: state => state.teamInfo,
  teamNames: state => [
    state.teamInfo.teamName,
    ...state.teamInfo.otherNames
      .split(',')
      .filter(team => team)
      .sort((a, b) => a.localeCompare(b)),
  ],
  keyword: state => state.keyword,
  teamList: state => state.teamList,
  recentGames: state => state.recentGames,
  allTeams: state => state.allTeams,
  requests: state => state.requests,
};

const actions = {
  editTeam({ commit }, data) {
    const { code: teamCode, nextAction } = data;
    commit(rootTypes.LOADING, true);
    const refTeamDoc = db.collection('teams').doc(teamCode);
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
          rootActions.alert({ commit }, i18n.t('msg_duplicate_team'));
          return false;
        } else {
          const batch = db.batch();
          data.players.forEach(player => {
            if (player.uid) {
              // set player role
              batch.set(
                db.collection('accounts').doc(player.uid),
                {
                  teamRoles: {
                    [teamCode]: player.manager ? 'manager' : 'player',
                  },
                  teams: fieldValue.arrayUnion(teamCode),
                },
                { merge: true },
              );
            } else if (player.self) {
              // forced set self role to manager
              batch.set(
                refPlayerDoc,
                {
                  teamRoles: { [teamCode]: 'manager' },
                  teams: fieldValue.arrayUnion(teamCode),
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
                        [teamCode]: 'bench',
                      },
                      teams: fieldValue.arrayUnion(teamCode),
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
                photo: prePlayer.photo,
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
                      [teamCode]: fieldValue.delete(),
                    },
                    teams: fieldValue.arrayRemove(teamCode),
                  },
                  { merge: true },
                );
              } else {
                // change player role to player
                batch.set(
                  db.collection('accounts').doc(prePlayer.uid),
                  {
                    teamRoles: {
                      [teamCode]: 'player',
                    },
                    teams: fieldValue.arrayUnion(teamCode),
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
                photo: find.photo,
              };
            });
          const players = [...data.players, ...benches2players].reduce(
            (acc, player) => {
              const { name, number = '', manager, photo, uid } = player;
              acc[name] = {
                number,
                manager,
                ...((uid || player.self) && {
                  uid: player.self ? playerDoc.id : uid,
                  photo: player.self ? playerDoc.data().photo : photo,
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
            const { msg, uid, photo } = player;
            acc[uid] = { msg, uid, photo };
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
              ...(data.isNew ? { createTime: timestamp } : undefined),
            },
            { merge: true },
          );
          return batch.commit();
        }
      })
      .then(res => {
        commit(rootTypes.LOADING, false);
        if (typeof nextAction === 'function') {
          nextAction();
        }
        if (res !== false && data.isNew) {
          router.push('/main/user');
        }
      })
      .catch(error => {
        console.log('Error getting document:', error);
      });
  },
  editTeamScore({ commit }, data) {
    const { teamCode, score, scoreKVP, nextAction } = data;
    commit(rootTypes.LOADING, true);
    new Promise(resolve => {
      if (score && scoreKVP) {
        resolve({ score, scoreKVP });
      } else {
        Promise.all([
          db
            .collection('teams')
            .doc(teamCode)
            .get(),
          db.collection(`teams/${teamCode}/games`).get(),
        ]).then(res => {
          const [teamDoc, gameCollection] = res;
          window.trackRead('editTeamScore: team doc', 1);
          window.trackRead(
            'editTeamScore: games in the team',
            gameCollection.docs.length || 1,
          );
          const data = teamDoc.data();
          const {
            benches: benches_ = {},
            players: players_ = {},
          } = teamDoc.data();
          const players = Object.keys(players_).map(name => ({
            name,
            manager: players_[name].manager,
            number: players_[name].number,
            uid: players_[name].uid,
            photo: players_[name].photo,
          }));
          const benches = Object.keys(benches_).map(uid => ({
            uid,
            msg: benches_[uid].msg,
            photo: benches_[uid].photo,
          }));

          const teamInfo = {
            teamCode: teamDoc.id,
            teamName: data.name,
            teamIntro: data.intro,
            otherNames: data.subNames,
            players: players.sort((a, b) => a.number - b.number),
            benches: benches.sort((a, b) => a.number - b.number),
            icon: data.icon,
            unlockGames: [...(data.unlockGames || [])],
          };
          const games = gameCollection.docs.map(doc => doc.data());
          const records = [].concat(
            ...gameCollection.docs.map(doc => doc.data().orders).filter(r => r),
          );
          resolve(
            evaluateTeamScore({
              teamInfo,
              games,
              records,
            }),
          );
        });
      }
    })
      .then(({ score, scoreKVP }) => {
        console.log(teamCode, score);
        return db
          .collection('teams')
          .doc(teamCode)
          .set({ score, scoreKVP }, { merge: true });
      })
      .then(() => {
        commit(rootTypes.LOADING, false);
        if (typeof nextAction === 'function') {
          nextAction();
        }
      })
      .catch(error => {
        console.log('Error getting document:', error);
      });
  },
  deleteTeam({ commit }, data) {
    const { teamCode, nextAction } = data;
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
      db.collection(`teams/${teamCode}/players`).get(),
      db.collection(`teams/${teamCode}/benches`).get(),
      db.collection(`teams/${teamCode}/games`).get(),
    ])
      .then(res => {
        const [
          accountCollection,
          requestCollection,
          playerCollection,
          benchCollection,
          gameCollection,
        ] = res;
        window.trackRead(
          'deleteTeam: accounts in the team',
          accountCollection.docs.length || 1,
        );
        window.trackRead(
          'deleteTeam: request join the team',
          requestCollection.docs.length || 1,
        );
        window.trackRead(
          'deleteTeam: players in the team',
          playerCollection.docs.length || 1,
        );
        window.trackRead(
          'deleteTeam: benches in the team',
          benchCollection.docs.length || 1,
        );
        window.trackRead(
          'deleteTeam: games in the team',
          gameCollection.docs.length || 1,
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
              status: 'deleted',
              timestamp,
            },
            { merge: true },
          );
        });
        playerCollection.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        benchCollection.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        gameCollection.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        batch.delete(db.collection('teams').doc(teamCode));
        return batch.commit();
      })
      .then(() => {
        commit(rootTypes.LOADING, false);
        if (typeof nextAction === 'function') {
          nextAction();
        } else {
          router.push('/main/user');
        }
      })
      .catch(error => {
        console.log('Error getting document:', error);
      });
  },
  fetchTeamInfo({ commit }, teamCode) {
    commit(types.CLEAR_TEAM);
    commit(rootTypes.LOADING, true);
    db.collection('teams')
      .doc(teamCode)
      .get()
      .then(teamDoc => {
        window.trackRead('fetchTeamInfo: team', 1);
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
            photo: players_[name].photo,
          }));
          const benches = Object.keys(benches_).map(uid => ({
            uid,
            msg: benches_[uid].msg,
            photo: benches_[uid].photo,
          }));
          commit(types.FETCH_TEAM, {
            id: teamDoc.id,
            players,
            benches,
            ...others,
          });
        }
        commit(rootTypes.LOADING, false);
      });
  },
  listenTeamChange({ commit }, teamCode) {
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
            commit(
              recordTypes.GET_PLAYERS,
              Object.keys(players_).map(name => ({
                id: name,
                data: players_[name],
              })),
            );

            if (
              preUnlockGames === undefined ||
              JSON.stringify(preUnlockGames) === JSON.stringify(unlockGames)
            ) {
              idbKeyval.getAll().then(localGames => {
                // if (['6CMMLMg6adPL3CyUWkWbPzIAYN62', 'M3VzysUPmDbsXX5gLgHsvZt8MEw1'].includes(rootState.userId)) {
                //   alert(458);
                // }
                const localIds = localGames.map(game => game.id);
                const gameShouldUpdates = localGames
                  .filter(
                    game =>
                      !game.timestamp ||
                      (games[game.id] &&
                        game.timestamp &&
                        !games[game.id].isEqual(game.timestamp)),
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
                    gameDocs.length || 1,
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
              photo: players_[name].photo,
            }));
            const benches = Object.keys(benches_).map(uid => ({
              uid,
              msg: benches_[uid].msg,
              photo: benches_[uid].photo,
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
  searchDemo({ commit, state }) {
    if (!state.demoTeam) {
      db.collection('teams')
        .doc('DEMO')
        .get()
        .then(doc => {
          window.trackRead('searchDemoTeam', 1);
          const data = doc.data();
          const demoTeam = {
            teamCode: doc.id,
            icon: data.icon,
            name: data.name,
            subNames: data.subNames,
            keyword: `${data.name}${
              data.subNames ? `${data.subNames.replace(/,/g, '')}` : ''
            }`,
          };
          commit(types.FETCH_DEMO_TEAM, demoTeam);
          commit(userTypes.FETCH_TEAMS, [demoTeam]);
        });
    }
  },
  searchTeams({ commit, state }, { keyword = '', type }) {
    commit(types.SET_KEYWORD, keyword);
    if (!keyword) {
      switch (type) {
        case 'join':
          commit(types.SEARCH_TEAM, []);
          break;
        case 'anonymous':
          commit(userTypes.FETCH_TEAMS, state.demoTeam ? [state.demoTeam] : []);
          break;
      }
      return;
    }
    commit(rootTypes.LOADING, true);
    new Promise(resolve => {
      if (state.cacheTeamsResponse) {
        resolve(state.cacheTeamsResponse);
      } else {
        db.collection('teams')
          .get()
          .then(teamCollection => {
            window.trackRead('searchTeams', teamCollection.docs.length || 1);
            const filterTeams = teamCollection.docs.map(doc => {
              const data = doc.data();
              return {
                teamCode: doc.id,
                icon: data.icon,
                name: data.name,
                subNames: data.subNames,
                keyword: `${data.name}${
                  data.subNames ? `${data.subNames.replace(/,/g, '')}` : ''
                }`,
                score: data.score,
              };
            });
            commit(types.CACHE_TEAMS, filterTeams);
            resolve(filterTeams);
          });
      }
    }).then(teams => {
      const filterTeams = teams
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
        .map(team => {
          return {
            ...team,
            score: team.teamCode === 'DEMO' ? 101 : team.score,
          };
        })
        .sort((a, b) => {
          if (a.score > b.score) {
            return -1;
          } else if (a.score === b.score) {
            return b.name.localeCompare(a.name);
          } else {
            return 1;
          }
        });

      switch (type) {
        case 'join':
          commit(
            types.SEARCH_TEAM,
            filterTeams.filter(team => team.teamCode !== 'DEMO'),
          );
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
  handleRequest(undefined, { requestId, action }) {
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
                    photo: data.photo,
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
                    photo: data.photo,
                  },
                },
              },
              { merge: true },
            );
          }
          batch.delete(refRequestDoc);
          batch.commit();
        });
        break;
    }
  },
  fetchDummyTeams({ commit }) {
    const currentTime = new Date();
    commit(rootTypes.LOADING, true);
    db.collection('teams')
      .get()
      .then(teamCollection => {
        window.trackRead('searchTeams', teamCollection.docs.length || 1);
        const allTeams = teamCollection.docs.map(doc => {
          const data = doc.data();
          return {
            teamCode: doc.id,
            ...data,
            timestamp: data.timestamp.toDate(),
          };
        });

        const today = formatDate(new Date());
        const nextDay = formatDate(
          new Date(new Date().setDate(new Date().getDate() + 1)),
        );
        const next2Days = formatDate(
          new Date(new Date().setDate(new Date().getDate() + 2)),
        );
        const recentGames = allTeams
          .filter(
            t =>
              typeof t.games === 'object' &&
              Object.keys(t.games).some(g =>
                [today, nextDay, next2Days].includes(g.split('-')[0]),
              ),
          )
          .map(t => ({
            name: t.name,
            today: Object.keys(t.games).filter(g =>
              [today].includes(g.split('-')[0]),
            ).length,
            nextDay: Object.keys(t.games).filter(g =>
              [nextDay].includes(g.split('-')[0]),
            ).length,
            next2Days: Object.keys(t.games).filter(g =>
              [next2Days].includes(g.split('-')[0]),
            ).length,
          }));
        const sum = recentGames.reduce(
          (acc, current) => {
            return {
              ...acc,
              today: acc.today + current.today,
              nextDay: acc.nextDay + current.nextDay,
              next2Days: acc.next2Days + current.next2Days,
            };
          },
          {
            name: 'HEADER_SUM_TOTAL',
            today: 0,
            nextDay: 0,
            next2Days: 0,
            col: [today, nextDay, next2Days],
          },
        );

        const filterTeams = allTeams.filter(team => {
          const lastTime = new Date(team.timestamp);
          const playerCount = Object.keys(team.players).filter(name => {
            return team.players[name].uid;
          }).length;
          const managerCount = Object.keys(team.players).filter(name => {
            return team.players[name].manager && team.players[name].uid;
          }).length;

          if (
            // !team.icon && // noicon
            currentTime - lastTime > 86400000 * 30 * 1 && // 1個月前
            playerCount === 1 && // only one binding user
            managerCount === 1 // is manager
          )
            return true;
        });

        commit(types.SEARCH_TEAM, filterTeams);
        commit(types.SEARCH_RECENT_GAMES, [sum, ...recentGames]);
        commit(types.SEARCH_ALL_TEAM, allTeams);
        commit(rootTypes.LOADING, false);
      });
  },
  leaveFromTeam({ commit }, data) {
    const { teamCode, nextAction } = data;
    const uid = auth.currentUser.uid;
    commit(rootTypes.LOADING, true);
    const refTeamDoc = db.collection('teams').doc(teamCode);
    const refPlayerDoc = db.collection('accounts').doc(uid);

    Promise.all([refTeamDoc.get(), refPlayerDoc.get()])
      .then(res => {
        const [teamDoc, playerDoc] = res;
        const team = teamDoc.data();
        const player = playerDoc.data();
        window.trackRead('leaveFromTeam: team doc', 1);
        window.trackRead('leaveFromTeam: current player doc', 1);

        if (player.teamRoles[teamCode] === 'player') {
          const batch = db.batch();

          batch.set(
            refPlayerDoc,
            {
              teamRoles: {
                [teamCode]: fieldValue.delete(),
              },
              teams: fieldValue.arrayRemove(teamCode),
            },
            { merge: true },
          );

          // is player
          const name = Object.keys(team.players).find(
            name => team.players[name].uid === uid,
          );
          if (name) {
            // unbind player
            batch.set(
              refTeamDoc,
              {
                players: {
                  [name]: {
                    photo: fieldValue.delete(),
                    uid: fieldValue.delete(),
                  },
                },
              },
              { merge: true },
            );
          }

          // is bench
          if (team.benches[uid] !== undefined) {
            // remove from bench
            batch.set(
              refTeamDoc,
              {
                benches: {
                  [uid]: fieldValue.delete(),
                },
              },
              { merge: true },
            );
          }
          return batch.commit();
        }
        if (player.teamRoles[teamCode] === 'manager') {
          rootActions.alert({ commit }, i18n.t('msg_disallowed_leave'));
          return false;
        }
      })
      .then(res => {
        commit(rootTypes.LOADING, false);
        if (res !== false) {
          if (typeof nextAction === 'function') {
            nextAction();
          }
          router.push('/main/user');
        }
      })
      .catch(error => {
        console.log('Error getting document:', error);
      });
  },
};

const mutations = {
  [types.CLEAR_TEAM](state) {
    state.teamInfo = {
      teamCode: '',
      teamName: '',
      teamIntro: '',
      otherNames: '',
      score: undefined,
      scoreKVP: {},
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
      score: data.score,
      scoreKVP: data.scoreKVP,
      players: [...data.players].sort((a, b) => a.number - b.number),
      benches: [...data.benches].sort((a, b) => a.number - b.number),
      icon: data.icon,
      unlockGames: [...(data.unlockGames || [])],
    };
  },
  [types.FETCH_DEMO_TEAM](state, data) {
    state.demoTeam = data;
  },
  [types.SET_KEYWORD](state, keyword) {
    state.keyword = keyword;
  },
  [types.SEARCH_TEAM](state, data) {
    state.teamList = data;
  },
  [types.SEARCH_RECENT_GAMES](state, data) {
    state.recentGames = data;
  },
  [types.SEARCH_ALL_TEAM](state, data) {
    state.allTeams = data;
  },
  [types.FETCH_REQUESTS](state, data) {
    state.requests = data;
  },
  [types.CACHE_TEAMS](state, data) {
    state.cacheTeamsResponse = data;
  },
};

export { types };
export default {
  state,
  getters,
  actions,
  mutations,
};
