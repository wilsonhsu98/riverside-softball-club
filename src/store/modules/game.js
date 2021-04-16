import i18n from '../../i18n';
import {
  types as rootTypes,
  actions as rootActions,
  // getters as rootGetters,
  // state as rootState,
  // promiseImage,
} from '../root';
import { db, auth, fieldValue, timestamp } from '../../firebase';
import router from '../../router';

// const types = {
//   FETCH_TEAM: 'TEAM/FETCH_TEAM',
//   SEARCH_TEAM: 'TEAM/SEARCH_TEAM',
//   FETCH_REQUESTS: 'TEAM/FETCH_REQUESTS',
//   FETCH_TEAM_REQUESTS: 'TEAM/FETCH_TEAM_REQUESTS',
// };

const state = {
  // teamInfo: {
  //   teamCode: '',
  //   teamName: '',
  //   teamIntro: '',
  //   otherNames: '',
  //   players: [{}],
  //   icon: '',
  // },
  // teamList: [],
  // requests: [],
  // teamRequests: [],
};

const getters = {
  // teamInfo: state => state.teamInfo,
  // teamList: state => state.teamList,
  // requests: state => state.requests,
  // teamRequests: state => state.teamRequests,
};

const actions = {
  editGame({ commit }, data) {
    const {
      teamCode,
      newId,
      prevId,
      useTeam,
      opponent,
      league,
      group,
      gameType = '',
      place,
      topBottom = '',
      coach = '',
      recorder = '',
      tags = '',
      result,
      opponentScores,
      pitcher = '',
      mvp = '',
      gwrbi = '',
      period = '',
      gameNote = '',
      youtubeVideos = '',
    } = data;
    commit(rootTypes.LOADING, true);
    const refNewGameDoc = db.doc(`teams/${teamCode}/games/${newId}`);
    refNewGameDoc
      .get()
      .then(newGameDoc => {
        if (newGameDoc.exists && prevId !== newId) {
          const error = i18n.t('msg_duplicate_game');
          rootActions.alert({ commit }, error);
          throw error;
        }
        return prevId && prevId !== newId
          ? db.doc(`teams/${teamCode}/games/${prevId}`).get()
          : undefined;
      })
      .then(prevGameDoc => {
        const batch = db.batch();
        batch.set(
          refNewGameDoc,
          {
            ...(prevGameDoc ? prevGameDoc.data() : {}),
            useTeam,
            opponent,
            league,
            group,
            gameType,
            place,
            topBottom,
            coach,
            recorder,
            tags,
            result,
            opponentScores,
            pitcher,
            mvp,
            gwrbi,
            period,
            gameNote,
            youtubeVideos,
            timestamp,
            ...(!prevId
              ? {
                  createInfo: {
                    creator: auth.currentUser.uid,
                    location: window.location.href,
                    data,
                  },
                }
              : undefined),
          },
          { merge: true },
        );
        batch.set(
          db.doc(`teams/${teamCode}`),
          {
            games: { [newId]: timestamp },
            unlockGames: fieldValue.arrayUnion(newId),
            timestamp,
          },
          { merge: true },
        );
        if (prevGameDoc) {
          batch.delete(db.doc(`teams/${teamCode}/games/${prevId}`));
          batch.set(
            db.doc(`teams/${teamCode}`),
            {
              games: { [prevId]: fieldValue.delete() },
              unlockGames: fieldValue.arrayRemove(prevId),
              timestamp,
            },
            { merge: true },
          );
        }
        return batch.commit();
      })
      .then(() => {
        if (prevId && prevId !== newId) {
          router.push(`/main/games/${teamCode}`);
        } else if (!prevId) {
          router.replace(`/main/games/${teamCode}/${newId}/edit`);
          router.push(`/main/games/${teamCode}/${newId}/order`);
        } else {
          router.push(`/main/games/${teamCode}/${newId}`);
        }
        commit(rootTypes.LOADING, false);
      })
      .catch(error => {
        console.log('Error editing document:', error);
        commit(rootTypes.LOADING, false);
      });
  },
  toggleGameStatus({ commit }, { teamCode, gameId, value }) {
    commit(rootTypes.LOADING, true);
    const batch = db.batch();
    batch.set(
      db.doc(`teams/${teamCode}`),
      {
        unlockGames:
          value === 'lock'
            ? fieldValue.arrayUnion(gameId)
            : fieldValue.arrayRemove(gameId),
        timestamp,
      },
      { merge: true },
    );
    batch
      .commit()
      .then(() => {
        commit(rootTypes.LOADING, false);
      })
      .catch(error => {
        console.log('Error editing document:', error);
        commit(rootTypes.LOADING, false);
      });
  },
  editGameOrder({ commit, dispatch }, data) {
    const { teamCode, gameId, orders, redirect } = data;
    commit(rootTypes.LOADING, true);
    const batch = db.batch();
    batch.set(
      db.doc(`teams/${teamCode}/games/${gameId}`),
      { orders, timestamp },
      { merge: true },
    );
    batch.set(
      db.doc(`teams/${teamCode}`),
      { games: { [gameId]: timestamp }, timestamp },
      { merge: true },
    );
    batch
      .commit()
      .then(() => {
        if (typeof redirect === 'function') {
          redirect();
        } else {
          dispatch('setGame', gameId);
          router.push(`/main/games/${teamCode}/${gameId}`);
        }
        commit(rootTypes.LOADING, false);
      })
      .catch(error => {
        console.log('Error editing document:', error);
        commit(rootTypes.LOADING, false);
      });
  },
  editGamePosition({ commit, dispatch }, data) {
    const { teamCode, gameId, positions, redirect } = data;
    commit(rootTypes.LOADING, true);
    const batch = db.batch();
    batch.set(
      db.doc(`teams/${teamCode}/games/${gameId}`),
      { positions, timestamp },
      { merge: true },
    );
    batch.set(
      db.doc(`teams/${teamCode}`),
      { games: { [gameId]: timestamp }, timestamp },
      { merge: true },
    );
    batch
      .commit()
      .then(() => {
        if (typeof redirect === 'function') {
          redirect();
        } else {
          dispatch('setGame', gameId);
          router.push(`/main/games/${teamCode}/${gameId}`);
        }
        commit(rootTypes.LOADING, false);
      })
      .catch(error => {
        console.log('Error editing document:', error);
        commit(rootTypes.LOADING, false);
      });
  },
  editGameDefense({ commit }, data) {
    const {
      teamCode,
      gameId,
      opponentScores,
      pitchers,
      pitcher,
      redirect,
    } = data;
    commit(rootTypes.LOADING, true);
    const batch = db.batch();
    batch.set(
      db.doc(`teams/${teamCode}/games/${gameId}`),
      {
        opponentScores: opponentScores.reduce(
          (acc, v) => [...acc, v === undefined ? '' : v],
          [],
        ),
        pitchers: pitchers.map(p => ({
          ...Object.keys(p).reduce((acc, key) => {
            if (Array.isArray(p[key])) {
              return {
                ...acc,
                [key]: p[key].reduce(
                  (acc, v) => [...acc, v === undefined ? '' : v],
                  [],
                ),
              };
            }
            return {
              ...acc,
              [key]: p[key],
            };
          }, {}),
        })),
        pitcher,
        timestamp,
      },
      { merge: true },
    );
    batch.set(
      db.doc(`teams/${teamCode}`),
      { games: { [gameId]: timestamp }, timestamp },
      { merge: true },
    );
    batch
      .commit()
      .then(() => {
        if (typeof redirect === 'function') {
          redirect();
        } else {
          // dispatch('setGame', gameId);
          // router.push(`/main/games/${teamCode}/${gameId}`);
        }
        commit(rootTypes.LOADING, false);
      })
      .catch(error => {
        console.log('Error editing document:', error);
        commit(rootTypes.LOADING, false);
      });
  },
  deleteGame({ commit }, data) {
    const { teamCode, gameId } = data;
    commit(rootTypes.LOADING, true);
    const batch = db.batch();
    batch.delete(db.doc(`teams/${teamCode}/games/${gameId}`));
    batch.set(
      db.doc(`teams/${teamCode}`),
      {
        games: { [gameId]: fieldValue.delete() },
        unlockGames: fieldValue.arrayRemove(gameId),
        timestamp,
      },
      { merge: true },
    );
    batch
      .commit()
      .then(() => {
        router.push(`/main/games/${teamCode}`);
        commit(rootTypes.LOADING, false);
      })
      .catch(error => {
        console.log('Error editing document:', error);
        commit(rootTypes.LOADING, false);
      });
  },
  deleteLastPa({ commit }, data) {
    const { teamCode, gameId, order = 0 } = data;
    const refGameDoc = db.doc(`teams/${teamCode}/games/${gameId}`);
    commit(rootTypes.LOADING, true);
    refGameDoc
      .get()
      .then(gameDoc => {
        const { orders } = gameDoc.data();
        const batch = db.batch();
        const newOrders = order
          ? orders.map(item => {
              return item.order === order ? { name: item.name } : item;
            })
          : orders.slice(0, -1);
        batch.set(
          refGameDoc,
          { orders: newOrders, timestamp },
          { merge: true },
        );
        batch.set(
          db.doc(`teams/${teamCode}`),
          { games: { [gameId]: timestamp }, timestamp },
          { merge: true },
        );
        return batch.commit();
      })
      .then(() => {
        router.push(`/main/games/${teamCode}/${gameId}`);
        commit(rootTypes.LOADING, false);
      })
      .catch(error => {
        console.log('Error editing document:', error);
        commit(rootTypes.LOADING, false);
      });
  },
};

const mutations = {
  // [types.FETCH_TEAM](state, data) {
  //   state.teamInfo = {
  //     teamCode: data.id,
  //     teamName: data.name,
  //     teamIntro: data.intro,
  //     otherNames: data.subNames,
  //     players: [...data.players].sort((a, b) => a.number - b.number),
  //     benches: data.benches,
  //     icon: data.icon,
  //   };
  // },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
