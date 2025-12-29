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
  managers: [
    'Ac1JwgNSkdctBkdoiOC0Fgn3mqE2', // riversidesoftballclub.app@gmail.com
    '6CMMLMg6adPL3CyUWkWbPzIAYN62', // wilsonhsu98@gmail.com
    'hV6hUUf3d8UqEKTwpMy8SOITTD63', // 阿哲
    'AOgHakBJcqMECh2lrJ4YKRtQdVx2', // 冠辰
    'akqyoG33huRE8ki1xT3HCdnKsLN2', // 卡布
    'zgSPKeQYN1ZHFT4oUg3339hChc42', // teddy
  ],
};
