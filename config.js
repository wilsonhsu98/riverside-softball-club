module.exports = {
  firebase: {
    apiKey: process.env.VUE_APP_FIREBASE_APIKEY,
    authDomain: window.location.host, //process.env.VUE_APP_FIREBASE_AUTHDOMAIN,
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
  managers: [
    'Ac1JwgNSkdctBkdoiOC0Fgn3mqE2', // riversidesoftballclub.app@gmail.com
    '6CMMLMg6adPL3CyUWkWbPzIAYN62', // wilsonhsu98@gmail.com
    'd73r94eHUqcI0TAMbd1qXizdEX62', // 阿哲
    'W898Wwv35BZn1KcxNnE1UUIihFE2', // 冠辰
    'M3VzysUPmDbsXX5gLgHsvZt8MEw1', // 卡布
    'kxZaIGUHPyRacyXMO8TYQKlDVO53', // teddy
  ],
};
