import i18n from '../../i18n';
import {
    types as rootTypes,
    getters as rootGetters,
    state as rootState,
    promiseImage,
} from '../root';
import { db, auth, timestamp } from "../../firebase";

const types = {
    FETCH_TEAM: 'TEAM/FETCH_TEAM',
};

const state = {
    teamInfo: {
        teamCode: '',
        teamName: '',
        teamIntro: '',
        otherNames: '',
        players: [{}],
        icon: window.localStorage.getItem('currentTeamIcon') || '',
    },
};

const getters = {
    teamInfo: state => state.teamInfo,
};

const actions = {
    editTeam({ commit, dispatch }, data) {
        commit(rootTypes.LOADING, true);

        const docRef = db.collection("teams").doc(data.code);
        Promise.all([promiseImage(data.icon, 'icon'), docRef.get()])
        .then(res => {
            const [url, doc] = res;
            if (doc.exists && data.isNew) {
                alert(i18n.t('msg_duplicate_team'));
                return true;
            } else {
                const batch = db.batch();
                batch.set(docRef, {
                    name: data.name,
                    subNames: data.subNames,
                    intro: data.intro,
                    icon: url,
                    timestamp,
                });
                data.players.forEach(item => {
                    let obj = {
                        number: item.number,
                        manager: item.manager,
                    };
                    if (item.self) {
                        batch.set(db.collection('accounts').doc(auth.currentUser.uid).collection('teams').doc(data.code), {
                            role: 'manager',
                            // icon: doc.data().icon,
                        });
                        obj = Object.assign(obj, {
                            uid: auth.currentUser.uid,
                            photo: auth.currentUser.photoURL,
                        });
                    }
                    batch.set(db.collection('teams').doc(data.code).collection('players').doc(item.name), obj);
                });
                return batch.commit();
            }
        }).then(() => {
            dispatch('fetchTeamInfo', data.code);
        }).catch(error => {
            console.log("Error getting document:", error);
        });
    },
    fetchTeamInfo({ commit }, teamCode) {
        commit(rootTypes.LOADING, true);
        Promise.all([
            db.collection("teams").doc(teamCode).get(),
            db.collection('teams').doc(teamCode).collection('players').get()
        ]).then(res => {
            if (res[0].exists) {
                const players = res[1].docs.map(doc => {
                    return Object.assign({ name: doc.id }, doc.data());
                });
                commit(types.FETCH_TEAM, Object.assign({ id: res[0].id }, res[0].data(), { players }));
            }
            commit(rootTypes.LOADING, false);
        });
    },
};

const mutations = {
    [types.FETCH_TEAM](state, data) {
        if (data.icon) window.localStorage.setItem('currentTeamIcon', data.icon);
        state.teamInfo = {
            teamCode: data.id,
            teamName: data.name,
            teamIntro: data.intro,
            otherNames: data.subNames,
            players: data.players.sort((a, b) => a.number > b.number),
            icon: data.icon,
        };
    },
};

export default {
    state,
    getters,
    actions,
    mutations,
};