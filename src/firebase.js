import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/messaging';
import config from '../config';

firebase.initializeApp(config.firebase);

const db = firebase.firestore();
const timestamp = firebase.firestore.FieldValue.serverTimestamp();
const f_timestamp = firebase.firestore.Timestamp;
const fieldValue = firebase.firestore.FieldValue;
db.settings({});

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
  'google.com': token =>
    firebase.auth.GoogleAuthProvider.credential(null, token),
  'facebook.com': token => firebase.auth.FacebookAuthProvider.credential(token),
  'github.com': token => firebase.auth.GithubAuthProvider.credential(token),
};

const messaging = (() => {
  if (firebase.messaging.isSupported()) {
    const fmsg = firebase.messaging();
    fmsg.usePublicVapidKey(
      'BFeaTTT1Dh8RoYytjYuMk3BktHvFDYrkZfDiRUlNtQyT8YbKpX5DnQU7rHq0x4YdP-xACIttBDFl6Tngy-v0BKw',
    );
    return fmsg;
  }
  return null;
})();

export {
  db,
  timestamp,
  f_timestamp,
  fieldValue,
  auth,
  providerMapping,
  credentialMapping,
  messaging,
};
