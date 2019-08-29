module.exports = {
  firebase: {
    apiKey: process.env.VUE_APP_FIREBASE_APIKEY,
    authDomain: process.env.VUE_APP_FIREBASE_AUTHDOMAIN,
    databaseURL: process.env.VUE_APP_FIREBASE_DATABASEURL,
    projectId: process.env.VUE_APP_FIREBASE_PROJECTID,
    storageBucket: process.env.VUE_APP_FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGINGSENDERID,
  },
  line: {
    loginUrl: process.env.VUE_APP_LINE_LOGINGURL,
  },
  imgur: {
    postUrl: process.env.VUE_APP_IMGUR_POSTURL,
    clientId: process.env.VUE_APP_IMGUR_CLIENTID,
    albumShare: process.env.VUE_APP_IMGUR_ALBUMSHARE,
    albumIcon: process.env.VUE_APP_IMGUR_ALBUMICON,
    albumAvatar: process.env.VUE_APP_IMGUR_ALBUMAVATAR,
  },
};
