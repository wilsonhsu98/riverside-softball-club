import axios from 'axios';
import { db, auth, providerMapping, credentialMapping } from "../firebase";
import router from '../router';
import config from'../../functions/config.json';

const types = {
    LOADING: 'LOADING',
    SET_TOKEN: 'SET_TOKEN',
    CLEAN_TOKEN: 'CLEAN_TOKEN',
    SET_USERID: 'SET_USERID',
    SET_USERNAME: 'SET_USERNAME',
    SET_ACCOUNT_INFO: 'SET_ACCOUNT_INFO',
    SET_AUTH: 'SET_AUTH',
};

const state = {
    loading: false,
    token: '',
    userId: '',
    userName: '',
    accountInfo: undefined,
    currentTeam: '',
    role: '',
};

const getters = {
    loading: state => state.loading,
    token: state => state.token || window.localStorage.getItem('token') || '',
    userId: state => state.userId || window.localStorage.getItem('user') || '',
    userName: state => state.userName || window.localStorage.getItem('userName') || '',
    accountInfo: state => {
        let info = window.localStorage.getItem('accountInfo');
        if (info) {
            info = JSON.parse(info);
        }
        return state.accountInfo || info || {};
    },
    currentTeam: state => state.currentTeam || window.localStorage.getItem('currentTeam') || '',
    role: state => state.role || window.localStorage.getItem('role') || '',
};

const actions = {
    toggleLoading({ commit }, isLoading) {
        commit(types.LOADING, isLoading);
    },
    googleLogin({ commit }) {
        auth.signInWithRedirect(providerMapping['google.com']);
    },
    fbLogin({ commit }) {
        auth.signInWithRedirect(providerMapping['facebook.com']);
    },
    githubLogin({ commit }) {
        auth.signInWithRedirect(providerMapping['github.com']);
    },
    lineLogin({ commit }) {
        window.location = `${config.line.loginUrl}?from=${encodeURIComponent(window.location.href)}`;
    },
    lineLoginRedirect({ commit }, token) {
        commit(types.LOADING, { img: true });
        auth.signInWithCustomToken(token).then(user => {
            if (user) {
                commit(types.SET_TOKEN, token);
                commit(types.SET_USERID, user.uid);

                const refPlayerDoc = db.collection("accounts").doc(user.uid);
                refPlayerDoc.get()
                    .then(doc => {
                        let data = {};
                        if (doc.exists) {
                            data = doc.data();
                        }
                        return Object.assign(data, {
                            accessToken: state.token,
                            name: data.name || user.displayName,
                            photo: data.photo || user.photoURL,
                        });
                    })
                    .then(res => {
                        return refPlayerDoc.set({
                            accessToken: res.accessToken,
                            name: res.name,
                            photo: res.photo,
                            line_photo: user.photoURL,
                        }, { merge: true })
                        .then(() => {
                            return res;
                        });
                    })
                    .then(res => {
                        const { accessToken, ...other } = res;
                        refPlayerDoc.collection("teams").get()
                            .then(snapshot => {
                                if (snapshot.docs.length) {
                                    commit(types.SET_AUTH, snapshot.docs.map(doc => ({ team: doc.id, role: doc.data().role })));
                                }
                            });
                        commit(types.SET_ACCOUNT_INFO, { ...other });
                        // commit(types.SET_USERNAME, snapshot.docs[0].id);
                        router.push('/main/user');
                        commit(types.LOADING, false);
                    });
            }
        });
    },
    chkLoginStatus({ commit }) {
        commit(types.LOADING, { img: true });
        auth.getRedirectResult().then(result => {
                const user = auth.currentUser;
                if (user) {
                    let promise = new Promise(resolve => {
                        resolve();
                    })
                    let providerData = result.user.providerData.find(item => item.providerId === result.credential.providerId);

                    // Link account if duplicated
                    let pendingCred = window.localStorage.getItem('pendingCred');
                    if (pendingCred) {
                        pendingCred = JSON.parse(pendingCred);
                        const token = credentialMapping[pendingCred.providerId](pendingCred.accessToken);
                        promise = user.linkWithCredential(token).then(res => {
                            window.localStorage.removeItem('pendingCred');
                            providerData = res.providerData.find(item => item.providerId === pendingCred.providerId);
                            return res;
                        });
                    }

                    const refPlayerDoc = db.collection("accounts").doc(user.uid);
                    promise.then(res => {
                            return refPlayerDoc.get()
                            .then(doc => {
                                let data = {};
                                if (doc.exists) {
                                    data = doc.data();
                                }
                                return Object.assign(data, {
                                    accessToken: result.credential.accessToken,
                                    name: data.name || providerData.displayName || providerData.email.split('@')[0],
                                    email: data.email || providerData.email,
                                    photo: data.photo || providerData.photoURL,
                                });
                            });
                        })
                        .then(res => {
                            return refPlayerDoc.set({
                                accessToken: res.accessToken,
                                name: res.name,
                                email: res.email,
                                photo: res.photo,
                                [`${providerData.providerId.split('.')[0]}_photo`]:
                                    providerData.providerId === 'facebook.com' ? `${providerData.photoURL}?type=large` : providerData.photoURL,
                            }, { merge: true })
                            .then(() => {
                                return res;
                            })
                        })
                        .then(res => {
                            const { accessToken, ...other } = res;
                            refPlayerDoc.collection("teams").get()
                                .then(snapshot => {
                                    if (snapshot.docs.length) {
                                        commit(types.SET_AUTH, snapshot.docs.map(doc => ({ team: doc.id, role: doc.data().role })));
                                    }
                                });
                            commit(types.SET_USERID, user.uid);
                            commit(types.SET_TOKEN, accessToken);
                            commit(types.SET_ACCOUNT_INFO, { ...other });
                            // commit(types.SET_USERNAME, snapshot.docs[0].id);
                            router.push('/main/user');
                            commit(types.LOADING, false);
                        });


                    // const refPlayers = db.collection("players");
                    // if (
                    //     result.additionalUserInfo &&
                    //     result.additionalUserInfo.isNewUser &&
                    //     result.additionalUserInfo.providerId === 'facebook.com'
                    // ) {
                    //     // new user registration & binding account
                    //     const fbGraphQL = `https://graph.facebook.com/v2.11/me?access_token=${state.token}&fields=name&locale=zh_TW`;
                    //     axios.get(fbGraphQL).then(res => refPlayers.where("fb", "==", res.data.name).get())
                    //         .then(snapshot => {
                    //             if (snapshot.size) {
                    //                 commit(types.SET_USERNAME, snapshot.docs[0].id);
                    //                 return refPlayers.doc(snapshot.docs[0].id).set({
                    //                     img: `https://graph.facebook.com/${result.additionalUserInfo.profile.id}/picture?type=large`,
                    //                     userId: user.uid,
                    //                 }, { merge: true })
                    //             } else {
                    //                 return;
                    //             }
                    //         })
                    //         .then(() => {
                    //             router.push('/main/user');
                    //             commit(types.LOADING, false);
                    //         });
                    // } else {
                    //     refPlayers.where("userId", "==", user.uid).get()
                    //         .then(snapshot => {
                    //             if (snapshot.size) {
                    //                 commit(types.SET_USERNAME, snapshot.docs[0].id);
                    //             }
                    //         })
                    //         .then(() => {
                    //             // go to main page
                    //             // router.push('/main/stats_pa');
                    //             router.push('/main/user');
                    //             commit(types.LOADING, false);
                    //         });
                    // }
                } else {
                    // wait for signin
                    // commit(types.CLEAN_TOKEN);
                    commit(types.LOADING, false);
                }
            })
            .catch(error => {
                if (error.code === 'auth/account-exists-with-different-credential') {
                    window.localStorage.setItem('pendingCred', JSON.stringify(error.credential));
                    auth.fetchProvidersForEmail(error.email).then(providers => {
                        auth.signInWithRedirect(providerMapping[providers[0]]);
                    });
                } else {
                    console.log('getRedirectResult error')
                    console.log(error);
                    commit(types.CLEAN_TOKEN);
                    commit(types.LOADING, false);
                }
            });
    },
    logout({ commit }) {
        auth.signOut().then(() => {
                commit(types.CLEAN_TOKEN);
            })
            .catch(error => {
                console.log('logout error');
                console.log(error);
            });
    },
};

const mutations = {
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
    [types.CLEAN_TOKEN](state) {
        window.localStorage.clear();
        state.token = '';
        state.userId = '';
        router.push('/login');
    },
    [types.SET_AUTH](state, auth) {
        const find = auth.find(item => item.team === window.localStorage.getItem('currentTeam'));
        if (find) {
            state.currentTeam = find.team;
            state.role = find.role;
        } else {
            window.localStorage.setItem('currentTeam', auth[0].team);
            window.localStorage.setItem('role', auth[0].role);
            state.currentTeam = auth[0].team;
            state.role = auth[0].role;
        }
    },
};

const promiseImage = (img) => {
    return new Promise((resolve, reject) => {
            if (img.indexOf('data:image/png;base64') > -1) {
                const formData = new FormData();
                formData.append('image', img.split(',')[1]);
                formData.append('album', config.imgur.albumAvatar);
                return axios.post(config.imgur.postUrl, formData, {
                    headers: {
                        Authorization: `Client-ID ${config.imgur.clientId}`
                    }
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

export {
    types,
    state,
    getters,
    actions,
    mutations,
    promiseImage,
};