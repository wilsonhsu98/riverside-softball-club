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
    FETCH_TEAMICON: 'TEAM/FETCH_TEAMICON',
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
    currentTeamIcon: '',
};

const getters = {
    teamInfo: state => state.teamInfo,
    currentTeamIcon: state => state.currentTeamIcon || window.localStorage.getItem('currentTeamIcon') || '',
};

const actions = {
    editTeam({ commit, dispatch }, data) {
        commit(rootTypes.LOADING, true);

        const refTeamDoc = db.collection("teams").doc(data.code);
        const refPlayerDoc = db.collection("accounts").doc(auth.currentUser.uid);
        Promise.all([
            promiseImage(data.icon, 'icon'),
            refTeamDoc.get(),
            refTeamDoc.collection('players').get(),
            refPlayerDoc.get()
        ]).then(res => {
            const [url, teamDoc, teamPlayersCollection, playerDoc] = res;
            if (teamDoc.exists && data.isNew) {
                alert(i18n.t('msg_duplicate_team'));
                return true;
            } else {
                const batch = db.batch();
                batch.set(refTeamDoc, {
                    name: data.name,
                    subNames: data.subNames,
                    intro: data.intro,
                    icon: url,
                    timestamp,
                });
                teamPlayersCollection.docs.forEach(item => {
                    if (!data.players.map(player => player.name).includes(item.id)) {
                        batch.delete(refTeamDoc.collection('players').doc(item.id));
                    }
                });
                data.players.forEach(item => {
                    let obj = {
                        number: item.number,
                        manager: item.manager,
                    };
                    if (item.self) {
                        batch.set(refPlayerDoc.collection('teams').doc(data.code), {
                            role: 'manager',
                        });
                        obj = Object.assign(obj, {
                            uid: playerDoc.id,
                            photo: playerDoc.data().photo,
                        });
                    }
                    batch.set(refTeamDoc.collection('players').doc(item.name), obj);
                });
                return batch.commit();
            }
        // }).then(() => {
        //     dispatch('fetchTeamInfo', data.code);
        }).catch(error => {
            console.log("Error getting document:", error);
        });
    },
    fetchTeamInfo({ commit }, teamCode) {
        commit(rootTypes.LOADING, true);

        const refTeamDoc = db.collection("teams").doc(teamCode);
        Promise.all([
            refTeamDoc.get(),
            refTeamDoc.collection('players').get()
        ]).then(res => {
            const [teamDoc, playerCollection] = res;
            if (teamDoc.exists) {
                const players = playerCollection.docs.map(doc => {
                    return Object.assign({ name: doc.id }, doc.data());
                });
                commit(types.FETCH_TEAM, Object.assign({ id: teamDoc.id }, teamDoc.data(), { players }));
            }
            commit(rootTypes.LOADING, false);
        });
    },
    fetchTeamIcon({ commit }, teamCode) {
        commit(rootTypes.LOADING, true);

        const refTeamDoc = db.collection("teams").doc(teamCode);
        let queryCount = 0;
        const realtimeCount = 1;
        refTeamDoc.onSnapshot(doc => {
            queryCount += 1;
            if (queryCount > realtimeCount) {
                // realtime
                commit(rootTypes.LOADING, { text: 'New data is coming' });
                setTimeout(() => {
                    if (doc.exists) {
                        commit(types.FETCH_TEAMICON, doc.data().icon);
                    }
                    commit(rootTypes.LOADING, false);
                }, 1000);
            } else {
                // first time
                if (doc.exists) {
                    commit(types.FETCH_TEAMICON, doc.data().icon);
                }
                if (queryCount === realtimeCount) {
                    commit(rootTypes.LOADING, false);
                }
            }
        });
    },
};

const mutations = {
    [types.FETCH_TEAM](state, data) {
        state.teamInfo = {
            teamCode: data.id,
            teamName: data.name,
            teamIntro: data.intro,
            otherNames: data.subNames,
            players: data.players.sort((a, b) => a.number > b.number),
            icon: data.icon,
        };
    },
    [types.FETCH_TEAMICON](state, data) {
        if (data) window.localStorage.setItem('currentTeamIcon', data);
        state.currentTeamIcon = data;
    },
};

export default {
    state,
    getters,
    actions,
    mutations,
};