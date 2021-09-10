import axios from 'axios';
import {
  db,
  auth,
  providerMapping,
  credentialMapping,
  // messaging,
} from '../firebase';
import router from '../router';
import config from '../../config';
import { state as userState, actions as userActions } from './modules/user';
// const lineLoginUrl = config.line.loginUrl;
const lineLoginUrl =
  process.env.NODE_ENV === 'production'
    ? config.line.loginUrl
    : 'http://localhost:9000/.netlify/functions/index/line_oauth';
let isFirst = true;
let chkLoginStatusDone = false;
let isLogout = false;

const types = {
  INIT_FROM_LS: 'INIT_FROM_LS',
  LOADING: 'LOADING',
  SET_TOKEN: 'SET_TOKEN',
  CLEAN_TOKEN: 'CLEAN_TOKEN',
  SET_USERID: 'SET_USERID',
  SET_USERNAME: 'SET_USERNAME',
  SET_ACCOUNT_INFO: 'SET_ACCOUNT_INFO',
  SET_AUTH: 'SET_AUTH',
  SET_TEAMICON: 'SET_TEAMICON',
  SET_PROVIDERID: 'SET_PROVIDERID',
  SET_ANONYMOUS: 'SET_ANONYMOUS',
  ALERT: 'ALERT',
  CONFIRM: 'CONFIRM',
  SET_UPDATE_AVAILABLE: 'SET_UPDATE_AVAILABLE',
};

const state = {
  loading: false,
  isAnonymous: undefined,
  token: '',
  userId: '',
  userName: '',
  accountInfo: undefined,
  currentTeam: '',
  role: '',

  providerId: '',
  accessToken: '',
  currentTeamIcon: '',
  alertMsg: '',
  confirmMsg: '',
  confirmMsgY: '',
  confirmMsgN: '',
  confirmPromiseResolve: () => {},
  confirmPromiseReject: () => {},
  updateAvailable: false,
};

const getters = {
  loading: state => state.loading,
  token: state => state.token || window.localStorage.getItem('token') || '',
  userId: state => state.userId || window.localStorage.getItem('user') || '',
  userName: state =>
    state.userName || window.localStorage.getItem('userName') || '',
  accountInfo: state =>
    state.accountInfo ||
    JSON.parse(window.localStorage.getItem('accountInfo')) ||
    {},
  currentTeam: state => state.currentTeam,
  currentTeamIcon: state => state.currentTeamIcon,
  role: state => state.role,
  isAnonymous: state => {
    if (state.userId || window.localStorage.getItem('user')) {
      return false;
    }
    return state.isAnonymous;
  },
  alertMsg: state => state.alertMsg,
  confirmMsg: state => state.confirmMsg,
  confirmMsgY: state => state.confirmMsgY,
  confirmMsgN: state => state.confirmMsgN,
  confirmPromiseResolve: state => state.confirmPromiseResolve,
  confirmPromiseReject: state => state.confirmPromiseReject,
  updateAvailable: state => state.updateAvailable,
  isViewMode: () => !!window.sessionStorage.getItem('currentTeam'),
};

const actions = {
  toggleLoading({ commit }, isLoading) {
    commit(types.LOADING, isLoading);
  },
  anonymousLogin({ commit }) {
    window.localStorage.removeItem('currentTeam');
    commit(types.LOADING, { img: true });
    auth.signInAnonymously();
  },
  googleLogin() {
    auth.signInWithRedirect(providerMapping['google.com']);
  },
  fbLogin() {
    auth.signInWithRedirect(providerMapping['facebook.com']);
  },
  githubLogin() {
    auth.signInWithRedirect(providerMapping['github.com']);
  },
  lineLogin() {
    window.location = `${lineLoginUrl}?from=${encodeURIComponent(
      window.location.href,
    )}`;
  },
  lineLoginRedirect({ commit }, token) {
    commit(types.LOADING, { img: true });
    auth.signInWithCustomToken(token).then(result => {
      const user = result.user;
      if (user) {
        commit(types.SET_PROVIDERID, 'password');
        commit(types.SET_TOKEN, token);
        commit(types.SET_USERID, user.uid);
        commit(types.SET_ANONYMOUS, false);

        const refPlayerDoc = db.collection('accounts').doc(user.uid);
        refPlayerDoc
          .get()
          .then(doc => {
            window.trackRead('lineLoginRedirect', 1);
            const data = doc.exists ? doc.data() : {};

            return {
              ...data,
              accessToken: state.token,
              name: data.name || user.displayName,
              photo: data.photo || user.photoURL,
            };
          })
          .then(res => {
            const { accessToken, ...other } = res;
            commit(types.SET_ACCOUNT_INFO, { ...other });
            return refPlayerDoc.set(
              {
                accessToken,
                name: res.name,
                photo: res.photo,
                line_photo: user.photoURL,
              },
              {
                merge: true,
              },
            );
          })
          .then(() => {
            userActions.fetchUser({ commit });
            // commit(types.SET_USERNAME, snapshot.docs[0].id);
            const next =
              JSON.parse(window.localStorage.getItem('next_url')) || {};
            if (next.hasOwnProperty('fullPath')) {
              router.push(next);
              window.localStorage.removeItem('next_url');
            } else {
              router.push('/main/user');
            }
            commit(types.LOADING, false);
          });
      }
    });
  },
  chkLoginStatus({ commit }) {
    if (chkLoginStatusDone) return;

    chkLoginStatusDone = true;
    commit(types.INIT_FROM_LS);
    commit(types.LOADING, { img: true });
    auth
      .getRedirectResult()
      .then(result => {
        if (result.credential) {
          commit(types.SET_PROVIDERID, result.credential.providerId);
          commit(types.SET_TOKEN, result.credential.accessToken);
          commit(types.SET_ANONYMOUS, false);
        }
      })
      .catch(error => {
        if (!isFirst) return; // prevent logout event trigger auth.getRedirectResult()
        isFirst = false;
        if (error.code === 'auth/account-exists-with-different-credential') {
          window.localStorage.setItem(
            'pendingCred',
            JSON.stringify(error.credential),
          );
          auth.fetchSignInMethodsForEmail(error.email).then(providers => {
            if (providers[0] === 'password') {
              db.collection('accounts')
                .where('email', '==', error.email)
                .get()
                .then(querySnapshot => {
                  querySnapshot.forEach(doc => {
                    commit(types.LOADING, { img: true });
                    auth.signInWithEmailAndPassword(
                      error.email,
                      doc.data().lineUserID,
                    );
                    commit(types.SET_PROVIDERID, 'password');
                    commit(types.SET_TOKEN, doc.data().accessToken);
                    commit(types.SET_ANONYMOUS, false);
                  });
                });
            } else {
              auth.signInWithRedirect(providerMapping[providers[0]]);
            }
          });
        } else {
          console.log('getRedirectResult error');
          console.log(error);
          commit(types.CLEAN_TOKEN);
          commit(types.LOADING, false);
        }
      });
    auth.onAuthStateChanged(user => {
      if (user) {
        if (user.isAnonymous) {
          commit(types.SET_TOKEN, user.refreshToken);
          commit(types.SET_USERNAME, user.uid);
          commit(types.SET_ANONYMOUS, true);
          router.push('/main/user');
          commit(types.LOADING, false);
          return;
        }
        if (user.uid.match(/LINE: /)) {
          commit(types.SET_ANONYMOUS, false);
          commit(types.LOADING, false);
          return;
        }
        if (!state.providerId) {
          commit(types.CLEAN_TOKEN);
          commit(types.LOADING, false);
          return;
        }
        // if (messaging) {
        //   messaging
        //     .requestPermission()
        //     .then(() => {
        //       console.log('Notification permission granted.');
        //       return messaging.getToken();
        //     })
        //     .then(token => {
        //       console.log(token);
        //     })
        //     .catch(err => {
        //       console.log('Unable to get permission to notify.', err);
        //     });
        // }
        let promise = new Promise(resolve => {
          resolve();
        });
        let providerData = user.providerData.find(
          item => item.providerId === state.providerId,
        );

        // Link account if duplicated
        let pendingCred = window.localStorage.getItem('pendingCred');
        if (pendingCred) {
          pendingCred = JSON.parse(pendingCred);
          const token = credentialMapping[pendingCred.providerId](
            pendingCred.accessToken,
          );
          promise = user.linkAndRetrieveDataWithCredential(token).then(res => {
            window.localStorage.removeItem('pendingCred');
            providerData = res.user.providerData.find(
              item => item.providerId === pendingCred.providerId,
            );
            return res;
          });
        }

        const refPlayerDoc = db.collection('accounts').doc(user.uid);
        promise
          .then(() => {
            const photo =
              providerData.providerId === 'facebook.com'
                ? `${providerData.photoURL}?type=large`
                : providerData.photoURL;

            return refPlayerDoc.get().then(doc => {
              window.trackRead('chkLoginStatus', 1);
              const data = doc.exists ? doc.data() : {};

              return {
                ...data,
                accessToken: state.token,
                name:
                  data.name ||
                  providerData.displayName ||
                  providerData.email.split('@')[0],
                email: data.email || providerData.email,
                photo: data.photo || photo,
                providerPhoto: photo,
              };
            });
          })
          .then(res => {
            const { providerPhoto, ...others } = res;
            const data = {
              ...others,
              accessToken: res.accessToken,
              name: res.name,
              email: res.email,
              photo: res.photo,
              [`${providerData.providerId.split('.')[0]}_photo`]: providerPhoto,
            };
            const { accessToken, ...otherInfo } = data;
            accessToken;
            commit(types.SET_USERID, user.uid);
            commit(types.SET_USERNAME, res.name);
            commit(types.SET_ACCOUNT_INFO, { ...otherInfo });
            commit(types.SET_ANONYMOUS, false);
            return refPlayerDoc.set(data, { merge: true });
          })
          .then(() => {
            userActions.fetchUser({ commit });
            if (router.history.current.path === '/login') {
              const next =
                JSON.parse(window.localStorage.getItem('next_url')) || {};
              if (next.hasOwnProperty('fullPath')) {
                router.push(next);
                window.localStorage.removeItem('next_url');
              } else {
                router.push('/main/user');
              }
            }
            commit(types.LOADING, false);
          });
      } else {
        if (isLogout === true || router.history.current.params.custom) {
          isLogout = false;
          commit(types.LOADING, { img: true });
        } else {
          // wait for signin
          commit(types.CLEAN_TOKEN);
          commit(types.LOADING, false);
        }
      }
    });

    actions.checkUpdateAvailable({ commit });
  },
  logout({ commit, state, getters }) {
    isLogout = true;
    commit(types.LOADING, { img: true });
    Object.keys(snapShot).forEach(key => {
      if (typeof snapShot[key] === 'function') snapShot[key]();
    });
    Object.keys(snapShotRequest).forEach(key => {
      if (typeof snapShotRequest[key] === 'function') snapShotRequest[key]();
    });
    auth
      .signOut()
      .then(() => {
        return new Promise(resolve => {
          if (state.isAnonymous) {
            axios
              .post(
                `https://securetoken.googleapis.com/v1/token?key=${config.firebase.apiKey}`,
                {
                  grant_type: 'refresh_token',
                  refresh_token: getters.token,
                },
              )
              .then(res =>
                axios.post(
                  `https://www.googleapis.com/identitytoolkit/v3/relyingparty/deleteAccount?key=${config.firebase.apiKey}`,
                  {
                    idToken: res.data.id_token,
                  },
                ),
              )
              .then(res => {
                resolve(res);
              });
          } else {
            resolve();
          }
        }).then(() => {
          commit(types.CLEAN_TOKEN);
          commit(types.LOADING, false);
        });
      })
      .catch(error => {
        console.log('logout error');
        console.log(error);
        commit(types.LOADING, false);
      });
  },
  silentLogout() {
    auth.signOut();
  },
  forceLogin({ commit }, version) {
    commit(types.CLEAN_TOKEN, version);
  },
  alert({ commit }, msg) {
    commit(types.ALERT, msg);
  },
  confirm({ commit }, msgObj) {
    if (typeof msgObj === 'object' && msgObj.msg) {
      return new Promise((resolve, reject) => {
        commit(types.CONFIRM, { ...msgObj, resolve, reject });
      });
    } else {
      commit(types.CONFIRM, {});
    }
  },
  checkUpdateAvailable({ commit }) {
    fetch('/')
      .then(res => res.text())
      .then(res => {
        const prevHash = window.localStorage.getItem('version_hash');
        const currentHash = res.replace(/.*\/app.?(.*)\.js.*/s, '$1');
        // const currentHash = new Date().getTime();
        if (prevHash) {
          if (prevHash !== currentHash) {
            commit(types.SET_UPDATE_AVAILABLE, true);
            window.localStorage.setItem('version_hash', currentHash);
          }
        } else {
          window.localStorage.setItem('version_hash', currentHash);
        }
      });
  },
};

const mutations = {
  [types.INIT_FROM_LS](state) {
    state.providerId =
      window.localStorage.getItem('providerId') || state.providerId;
    state.token = window.localStorage.getItem('token') || state.token;
  },
  [types.LOADING](state, isLoading) {
    state.loading = isLoading;
  },
  [types.SET_TOKEN](state, token) {
    window.localStorage.setItem('token', token);
    state.token = token;
  },
  [types.SET_USERID](state, userId) {
    window.localStorage.setItem('user', userId);
    state.userId = userId;
  },
  [types.SET_USERNAME](state, userName) {
    window.localStorage.setItem('userName', userName);
    state.userName = userName;
  },
  [types.SET_ACCOUNT_INFO](state, accountInfo) {
    window.localStorage.setItem('accountInfo', JSON.stringify(accountInfo));
    state.accountInfo = accountInfo;
  },
  [types.CLEAN_TOKEN](state, forceVersion) {
    const version = window.localStorage.getItem('version');
    const currentTeam = window.localStorage.getItem('currentTeam');
    const idb = window.localStorage.getItem('idb');
    const nextUrl = window.localStorage.getItem('next_url');
    window.localStorage.clear();
    state.token = '';
    state.userId = '';
    state.accountInfo = '';
    state.currentTeam = '';
    state.currentTeamIcon = '';
    state.isAnonymous = undefined;
    userState.teams = null;
    window.localStorage.setItem('version', forceVersion || version);
    if (currentTeam) window.localStorage.setItem('currentTeam', currentTeam);
    if (idb) window.localStorage.setItem('idb', idb);
    if (nextUrl) window.localStorage.setItem('next_url', nextUrl);
    router.push('/login');
  },
  [types.SET_AUTH](state, auth = []) {
    if (window.sessionStorage.getItem('currentTeam')) return;
    const find = auth.find(
      item => item.teamCode === window.localStorage.getItem('currentTeam'),
    );
    if (find) {
      state.currentTeam = find.teamCode;
      state.currentTeamIcon = find.icon;
      state.role = find.role;
    } else if (auth.length) {
      state.currentTeam = auth[0].teamCode;
      state.currentTeamIcon = auth[0].icon;
      state.role = auth[0].role;
    } else {
      state.currentTeam = '';
      state.currentTeamIcon = '';
      state.role = '';
    }
    window.localStorage.setItem('currentTeam', state.currentTeam);
  },
  [types.SET_TEAMICON](state, data) {
    state.currentTeamIcon = data;
  },
  [types.SET_PROVIDERID](state, providerId) {
    window.localStorage.setItem('providerId', providerId);
    state.providerId = providerId;
  },
  [types.SET_ANONYMOUS](state, isAnonymous) {
    state.isAnonymous = isAnonymous;
    if (isAnonymous) {
      state.currentTeam = window.localStorage.getItem('currentTeam');
    }
  },
  [types.ALERT](state, msg = '') {
    state.alertMsg = msg;
  },
  [types.CONFIRM](
    state,
    { msg = '', y = '', n = '', resolve = () => {}, reject = () => {} },
  ) {
    state.confirmMsg = msg;
    state.confirmMsgY = y;
    state.confirmMsgN = n;
    state.confirmPromiseResolve = resolve;
    state.confirmPromiseReject = reject;
  },
  [types.SET_UPDATE_AVAILABLE](state, val) {
    state.updateAvailable = val;
  },
};

const promiseImage = (img, type) => {
  const mapping = {
    avatar: 'albumAvatar',
    icon: 'albumIcon',
  };
  return new Promise((resolve, reject) => {
    if (img.indexOf('data:image/png;base64') > -1) {
      const formData = new FormData();
      formData.append('image', img.split(',')[1]);
      formData.append('album', config.imgur[mapping[type.toLowerCase()]]);
      return axios
        .post(config.imgur.postUrl, formData, {
          headers: {
            Authorization: `Client-ID ${config.imgur.clientId}`,
          },
        })
        .then(res => {
          resolve(res.data.data.link);
        })
        .catch(e => {
          reject(e);
        });
    } else {
      resolve(img);
    }
  });
};

const snapShot = {};
const snapShotRequest = {};

export {
  types,
  state,
  getters,
  actions,
  mutations,
  promiseImage,
  snapShot,
  snapShotRequest,
};
