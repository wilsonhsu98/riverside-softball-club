import firebase from 'firebase';
import 'firebase/firestore';
import config from'../config.json';

firebase.initializeApp(config.firebase);

const db = firebase.firestore();
const timestamp = firebase.firestore.FieldValue.serverTimestamp();

// provider.addScope('public_profile');
// provider.addScope('user_birthday');

const auth = firebase.auth();
auth.useDeviceLanguage();

const providerMapping = {
	'google.com': new firebase.auth.GoogleAuthProvider(),
	'facebook.com': new firebase.auth.FacebookAuthProvider(),
	'github.com': new firebase.auth.GithubAuthProvider(),
};
const credentialMapping = {
	'google.com': (token) => firebase.auth.GoogleAuthProvider.credential(token),
	'facebook.com': (token) => firebase.auth.FacebookAuthProvider.credential(token),
	'github.com': (token) => firebase.auth.GithubAuthProvider.credential(token),
};

export {
    db,
    timestamp,
    auth,
    providerMapping,
    credentialMapping,
};