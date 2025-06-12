require('dotenv').config();

module.exports = {
  apiKey: process.env.VUE_APP_FIREBASE_APIKEY,

  serviceAccount: {
    type: process.env.VUE_APP_FIREBASE_SA_TYPE,
    project_id: process.env.VUE_APP_FIREBASE_SA_PROJECTID,
    private_key_id: process.env.VUE_APP_FIREBASE_SA_PRIVATEKEYID,
    private_key: process.env.VUE_APP_FIREBASE_SA_PRIVATEKEY.replace(
      /\\n/g,
      '\n',
    ),
    client_email: process.env.VUE_APP_FIREBASE_SA_CLIENTEMAIL,
    client_id: process.env.VUE_APP_FIREBASE_SA_CLIENTID,
    auth_uri: process.env.VUE_APP_FIREBASE_SA_AUTHURI,
    token_uri: process.env.VUE_APP_FIREBASE_SA_TOKENURI,
    auth_provider_x509_cert_url:
      process.env.VUE_APP_FIREBASE_SA_AUTHPROVIDERX509CERTURL,
    client_x509_cert_url: process.env.VUE_APP_FIREBASE_SA_CLIENTX509CERTURL,
  },

  line: {
    clientId: process.env.VUE_APP_LINE_CLIENTID,
    clientSecret: process.env.VUE_APP_LINE_CLIENTSECRET,
    loginUrl: process.env.VUE_APP_LINE_LOGINGURL,
  },

  fb: {
    clientSecret: process.env.VUE_APP_FB_CLIENTSECRET,
  },

  imgur: {
    postUrl: process.env.VUE_APP_IMGUR_POSTURL,
    clientSecret: process.env.VUE_APP_IMGUR_CLIENTID,
  },
};
