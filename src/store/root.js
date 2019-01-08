import axios from "axios";
import { db, auth, providerMapping, credentialMapping } from "../firebase";
import router from "../router";
import config from "../../config.json";
const lineLoginUrl = process.env.NODE_ENV === "production" ? config.line.loginUrl : "http://localhost:5000/riversidesoftballclub/us-central1/api/line_oauth";
let isFirst = true;

const types = {
	INIT_FROM_LS: "INIT_FROM_LS",
	LOADING: "LOADING",
	SET_TOKEN: "SET_TOKEN",
	CLEAN_TOKEN: "CLEAN_TOKEN",
	SET_USERID: "SET_USERID",
	SET_USERNAME: "SET_USERNAME",
	SET_ACCOUNT_INFO: "SET_ACCOUNT_INFO",
	SET_AUTH: "SET_AUTH",
	SET_PROVIDERID: "SET_PROVIDERID",
	SET_ANONYMOUS: "SET_ANONYMOUS",
};

const state = {
	loading: false,
	isAnonymous: false,
	token: "",
	userId: "",
	userName: "",
	accountInfo: undefined,
	currentTeam: "",
	role: "",

	providerId: "",
	accessToken: "",
};

const getters = {
	loading: state => state.loading,
	token: state => state.token || window.localStorage.getItem("token") || "",
	userId: state => state.userId || window.localStorage.getItem("user") || "",
	userName: state => state.userName || window.localStorage.getItem("userName") || "",
	accountInfo: state => {
		let info = window.localStorage.getItem("accountInfo");
		if (info) {
			info = JSON.parse(info);
		}
		return state.accountInfo || info || {};
	},
	currentTeam: state => state.currentTeam || window.localStorage.getItem("currentTeam") || "",
	role: state => state.role || window.localStorage.getItem("role") || "",
	isAnonymous: state => state.isAnonymous || window.localStorage.getItem("isAnonymous") === "true",
};

const actions = {
	toggleLoading({ commit }, isLoading) {
		commit(types.LOADING, isLoading);
	},
	anonymousLogin({ commit }) {
		commit(types.LOADING, { img: true });
		auth.signInAnonymously();
	},
	googleLogin() {
		auth.signInWithRedirect(providerMapping["google.com"]);
	},
	fbLogin() {
		auth.signInWithRedirect(providerMapping["facebook.com"]);
	},
	githubLogin() {
		auth.signInWithRedirect(providerMapping["github.com"]);
	},
	lineLogin() {
		window.location = `${lineLoginUrl}?from=${encodeURIComponent(window.location.href)}`;
	},
	lineLoginRedirect({ commit }, token) {
		commit(types.LOADING, { img: true });
		auth.signInWithCustomToken(token).then(result => {
			const user = result.user;
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
						return {
							...data,
							accessToken: state.token,
							name: data.name || user.displayName,
							photo: data.photo || user.photoURL
						};
					})
					.then(res => {
						const { accessToken, ...other } = res;
						return Promise.all([
							refPlayerDoc.set({
								accessToken,
								name: res.name,
								photo: res.photo,
								line_photo: user.photoURL,
							}, {
								merge: true
							}),
							refPlayerDoc.collection("teams").get(),
							other
						]);
					})
					.then(res => {
						const [, snapshot, other] = res; //setAction
						if (snapshot.docs.length) {
							commit(
								types.SET_AUTH,
								snapshot.docs.map(doc => ({
									team: doc.id,
									role: doc.data().role
								}))
							);
						}
						commit(types.SET_ACCOUNT_INFO, { ...other });
						// commit(types.SET_USERNAME, snapshot.docs[0].id);
						router.push("/main/user");
						commit(types.LOADING, false);
					});
			}
		});
	},
	chkLoginStatus({ commit }) {
		commit(types.INIT_FROM_LS);
		commit(types.LOADING, { img: true });
		auth.getRedirectResult()
			.then(result => {
				if (result.credential) {
					commit(types.SET_PROVIDERID, result.credential.providerId);
					commit(types.SET_TOKEN, result.credential.accessToken);
				}
			})
			.catch(error => {
				if (!isFirst) return; // prevent logout event trigger auth.getRedirectResult()
				isFirst = false;
				if (error.code === "auth/account-exists-with-different-credential") {
					window.localStorage.setItem("pendingCred", JSON.stringify(error.credential));
					auth.fetchSignInMethodsForEmail(error.email).then(providers => {
						if (providers[0] === 'password') {
							db.collection("accounts").where("email", "==", error.email)
								.get()
								.then(querySnapshot => {
									querySnapshot.forEach(doc => {
										commit(types.LOADING, { img: true });
										auth.signInWithEmailAndPassword(error.email, doc.data().lineUserID);
										commit(types.SET_PROVIDERID, "password");
										commit(types.SET_TOKEN, doc.data().accessToken);
									});
								});
						} else {
							auth.signInWithRedirect(providerMapping[providers[0]]);
						}
					});
				} else {
					console.log("getRedirectResult error");
					console.log(error);
					commit(types.CLEAN_TOKEN);
					commit(types.LOADING, false);
				}
			});
		auth.onAuthStateChanged(user => {
			if (user && user.isAnonymous) {
				commit(types.SET_TOKEN, user.refreshToken);
				commit(types.SET_USERNAME, user.uid);
				commit(types.SET_ANONYMOUS, true);
				// go to main page
				router.push("/main/stats_pa");
				commit(types.LOADING, false);
				return;
			}
			if (user) {
				let promise = new Promise(resolve => { resolve(); });
				let providerData = user.providerData.find(item => item.providerId === state.providerId);

				// Link account if duplicated
				let pendingCred = window.localStorage.getItem("pendingCred");
				if (pendingCred) {
					pendingCred = JSON.parse(pendingCred);
					const token = credentialMapping[pendingCred.providerId](pendingCred.accessToken);
					promise = user.linkAndRetrieveDataWithCredential(token).then(res => {
						window.localStorage.removeItem("pendingCred");
						providerData = res.user.providerData.find(item => item.providerId === pendingCred.providerId);
						return res;
					});
				}

				const refPlayerDoc = db.collection("accounts").doc(user.uid);
				promise
					.then(() => {
						const photo = providerData.providerId === "facebook.com" ? `${providerData.photoURL}?type=large` : providerData.photoURL;

						return refPlayerDoc.get().then(doc => {
							let data = {};
							if (doc.exists) {
								data = doc.data();
							}
							return {
								...data,
								accessToken: state.token,
								name:
									data.name ||
									providerData.displayName ||
									providerData.email.split("@")[0],
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
							[`${providerData.providerId.split(".")[0]}_photo`]: providerPhoto,
						};
						return Promise.all([
							refPlayerDoc.set(data, { merge: true }),
							refPlayerDoc.collection("teams").get(),
							data
						]);
					})
					.then(res => {
						const [, snapshot, data] = res; //setAction
						const { accessToken, ...other } = data;
						if (snapshot.docs.length) {
							commit(
								types.SET_AUTH,
								snapshot.docs.map(doc => ({
									team: doc.id,
									role: doc.data().role
								}))
							);
						}
						commit(types.SET_USERID, user.uid);
						commit(types.SET_ACCOUNT_INFO, { ...other });
						// commit(types.SET_USERNAME, snapshot.docs[0].id);
						router.push("/main/user");
						commit(types.LOADING, false);
					});
			} else {
				// wait for signin
				// commit(types.CLEAN_TOKEN);
				commit(types.LOADING, false);
			}
		});
	},
	logout({ commit }) {
		auth.signOut()
			.then(() => {
				let promise = new Promise(resolve => { resolve(); });
				if (state.isAnonymous) {
					promise = promise
						.then(() => {
							return axios
								.post(`https://securetoken.googleapis.com/v1/token?key=${config.firebase.apiKey}`, {
									grant_type: 'refresh_token',
									refresh_token: state.token,
								});
						})
						.then(res => {
							return axios
								.post(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/deleteAccount?key=${config.firebase.apiKey}`, {
									idToken: res.data.id_token,
								})
						});
				}
				return promise
					.then(() => {
						commit(types.CLEAN_TOKEN);
					});
			})
			.catch(error => {
				console.log("logout error");
				console.log(error);
			});
	}
};

const mutations = {
	[types.INIT_FROM_LS](state) {
		state.providerId = window.localStorage.getItem("providerId") || state.providerId;
		state.token = window.localStorage.getItem("token") || state.token;
	},
	[types.LOADING](state, isLoading) {
		state.loading = isLoading;
	},
	[types.SET_TOKEN](state, token) {
		window.localStorage.setItem("token", token);
		state.token = token;
	},
	[types.SET_USERID](state, userId) {
		window.localStorage.setItem("user", userId);
		state.userId = userId;
	},
	[types.SET_USERNAME](state, userName) {
		window.localStorage.setItem("userName", userName);
		state.userName = userName;
	},
	[types.SET_ACCOUNT_INFO](state, accountInfo) {
		window.localStorage.setItem("accountInfo", JSON.stringify(accountInfo));
		state.accountInfo = accountInfo;
	},
	[types.CLEAN_TOKEN](state) {
		const version = window.localStorage.getItem("version");
		window.localStorage.clear();
		state.token = "";
		state.userId = "";
		state.accountInfo = "";
		state.isAnonymous = false;
		router.push("/login");
		window.localStorage.setItem("version", version);
	},
	[types.SET_AUTH](state, auth) {
		const find = auth.find(item => item.team === window.localStorage.getItem("currentTeam"));
		if (find) {
			state.currentTeam = find.team;
			state.role = find.role;
		} else {
			window.localStorage.setItem("currentTeam", auth[0].team);
			window.localStorage.setItem("role", auth[0].role);
			state.currentTeam = auth[0].team;
			state.role = auth[0].role;
		}
	},
	[types.SET_PROVIDERID](state, providerId) {
		window.localStorage.setItem("providerId", providerId);
		state.providerId = providerId;
	},
	[types.SET_ANONYMOUS](state, isAnonymous) {
		window.localStorage.setItem("isAnonymous", isAnonymous);
		state.isAnonymous = isAnonymous;
	},
};

const promiseImage = (img, type) => {
	const mapping = {
		avatar: "albumAvatar",
		icon: "albumIcon"
	};
	return new Promise((resolve, reject) => {
		if (img.indexOf("data:image/png;base64") > -1) {
			const formData = new FormData();
			formData.append("image", img.split(",")[1]);
			formData.append("album", config.imgur[mapping[type.toLowerCase()]]);
			return axios
				.post(config.imgur.postUrl, formData, {
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

export { types, state, getters, actions, mutations, promiseImage };
