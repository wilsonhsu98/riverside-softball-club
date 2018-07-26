import i18n from '../../i18n';
import {
    types as rootTypes,
    promiseImage,
} from '../root';
import router from '../../router';
import { db, auth, timestamp } from "../../firebase";

const types = {
    // FETCH_TEAM: 'TEAM/FETCH_TEAM',
};

const state = {
    // teamInfo: {
    //     teamCode: '',
    //     teamName: '',
    //     teamIntro: '',
    //     otherNames: '',
    //     players: [{}],
    //     icon: window.localStorage.getItem('currentTeamIcon') || '',
    // },
};

const getters = {
    // teamInfo: state => state.teamInfo,
};

const actions = {
    editAvatar({ commit }, data) {
        commit(rootTypes.LOADING, true);
        const refPlayerDoc = db.collection("accounts").doc(data.userId);

        promiseImage(data.custom)
        .then(url => {
            let photo = undefined;
            if (data.current === undefined) {
                photo = data.accountInfo.photo;
            } else if (data.current === 'custom') {
                photo = url;
            } else {
                photo = data.accountInfo[`${data.current}_photo`];
            }
            return new Promise((resolve, reject) => {
                const batch = db.batch();
                batch.update(refPlayerDoc, {
                    photo,
                    custom_photo: url,
                });
                refPlayerDoc.collection('teams').get().then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        db.collection("teams").doc(doc.id).collection("players").where("uid", "==", data.userId).get().then(querySnapshot => {
                            querySnapshot.forEach(doc => {
                                batch.update(doc.ref, {
                                    photo,
                                });
                            });
                            resolve(batch.commit());
                        });
                    });
                    if (querySnapshot.size === 0) {
                        resolve(batch.commit());
                    }
                });

            });
        })
        .then(() => {
            return refPlayerDoc.get();
        })
        .then(doc => {
            const { accessToken, ...other } = doc.data();
            commit(rootTypes.SET_ACCOUNT_INFO, { ...other });
            commit(rootTypes.LOADING, false);
            router.push('/main/user');
        })
        .catch(e => {
            console.log(e);
        });
    },
};

const mutations = {
    // [types.FETCH_TEAM](state, data) {
    //     if (data.icon) window.localStorage.setItem('currentTeamIcon', data.icon);
    //     state.teamInfo = {
    //         teamCode: data.id,
    //         teamName: data.name,
    //         teamIntro: data.intro,
    //         otherNames: data.subNames,
    //         players: data.players.sort((a, b) => a.number > b.number),
    //         icon: data.icon,
    //     };
    // },
};

export default {
    state,
    getters,
    actions,
    mutations,
};