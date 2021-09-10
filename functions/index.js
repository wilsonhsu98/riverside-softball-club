const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = require('./config');
admin.initializeApp({
  ...functions.config().firebase,
  credential: admin.credential.cert(config.serviceAccount),
});
const db = admin.firestore();
const timestamp = admin.firestore.FieldValue.serverTimestamp();

exports.import_game = functions.https.onRequest((req, res) => {
  const body = req.body;
  const game = body.game;
  const teddySummary = body.summary.find(item => item['場次'] === game);
  const parseResult = parseGame(body.rawdata);
  db.collection('teams')
    .doc('OldStar')
    .collection('games')
    .doc(game)
    .set({
      version: 'import',
      orders: parseResult.orders,
      errors: parseResult.errors,
      result: ['win', 'lose', 'tie', ''][
        ['勝', '敗', '和', ''].indexOf(teddySummary ? teddySummary['結果'] : 3)
      ],
      period: teddySummary
        ? `${teddySummary['年度']}${teddySummary['季度']}`
        : '',
      gameType: teddySummary
        ? teddySummary['季度'].indexOf('季後') > -1
          ? 'playoff'
          : 'regular'
        : '',
      opponent: teddySummary ? teddySummary['對手'] : '',
      league: teddySummary ? teddySummary['聯盟'] : '',
      coach: teddySummary ? teddySummary['教練'] : '',
      place: ['零', '一', '二', '三'].indexOf(
        teddySummary ? teddySummary['休息區'] : '',
      ),
      group: teddySummary ? teddySummary['組別'] : '',
      useTeam: [
        'TrendMicro',
        'TrendMicro',
        'TrendMicro',
        '趨勢科技',
        '趨勢科技',
        '趨勢科技',
        '',
      ][
        ['B', 'C', 'D', 'E', 'F', 'G', ''].indexOf(
          teddySummary ? teddySummary['組別'] : '',
        )
      ],
      timestamp,
    })
    .then(writeResult => {
      res.json(writeResult);
    });
});

const contentMapping = {
  '1H': '1H',
  '2H': '2H',
  '3H': '3H',
  HR: 'HR',
  飛球: 'FO',
  滾地: 'GO',
  BB: 'BB',
  K: 'K',
  FOUL: 'FOUL',
  E: 'E',
  野選: 'FC',
  犧飛: 'SF',
  雙殺: 'DP',
  三殺: 'TP',
};
const parseGame = arr => {
  var nameCol = arr[0].indexOf('名單'),
    errCol = arr[0].indexOf('失誤'),
    startCol = arr[0].indexOf('一'),
    row = 1,
    col = startCol,
    order = 1,
    result = [],
    scan = [],
    innArray = ['', '一', '二', '三', '四', '五', '六', '七'],
    errorArr = [];

  while (col < arr[0].length && row < arr.length) {
    if (scan.indexOf(row + '' + col) === -1) {
      scan.push(row + '' + col);
      if (arr[row][col]) {
        var run = '';
        if (arr[row][col + 2] === 'R') {
          run = arr[row][nameCol];
        } else if (
          row + 1 < arr.length &&
          arr[row + 1][col] === '' &&
          arr[row + 1][col + 2] === 'R'
        ) {
          run = arr[row + 1][nameCol];
        }
        result.push({
          order: order++,
          inn: innArray.indexOf(arr[0][col]),
          name: arr[row][nameCol],
          content: contentMapping[arr[row][col]],
          r: run,
          rbi: arr[row][col + 1],
          _row: row,
        });
      }
    }
    if (arr[row][errCol] && col === startCol) {
      errorArr.push({
        name: arr[row][nameCol],
        count: arr[row][errCol],
      });
    }
    row++;
    if (row === arr.length) {
      if (scan.indexOf('1' + col) === -1) {
        row = 1;
      } else {
        col += 3;
        if (result[result.length - 1]) {
          if (result[result.length - 1]._row === arr.length - 1) {
            row = 1;
          } else {
            row = result[result.length - 1]._row + 1;
          }
        } else {
          row = 1;
        }
      }
    }
  }
  return {
    orders: result.map(item => {
      const { _row, ...others } = item;
      _row;
      return { ...others };
    }),
    errors: errorArr,
  };
};

// Line OAuth 2 setup
const credentials = {
  client: {
    id: config.line.clientId,
    secret: config.line.clientSecret,
  },
  auth: {
    tokenHost: 'https://api.line.me',
    tokenPath: '/oauth2/v2.1/token',
    authorizeHost: 'https://access.line.me',
    authorizePath: '/oauth2/v2.1/authorize',
  },
};
const restUrl = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty';
const oauth2 = require('simple-oauth2').create(credentials);
const rp = require('request-promise');
const serverless = require('serverless-http');
const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const url = require('url');

// Path to the OAuth handlers.
const OAUTH_REDIRECT_PATH = '/line_oauth';
const OAUTH_CALLBACK_PATH = '/line_oauth_callback';
// scopes requested.
const OAUTH_SCOPES = 'openid profile email';

const app = express();
const router = express.Router();
app.enable('trust proxy');
app.use(express.static('public'));
app.use(express.static('node_modules/instafeed.js'));
app.use(cookieParser());

/**
 * Redirects the User to the Instagram authentication consent screen. Also the 'state' cookie is set for later state verification.
 */
router.get(OAUTH_REDIRECT_PATH, (req, res) => {
  const isLocalhost = (req.get('host') || '').indexOf('localhost') > -1;
  const fullUrlObj = url.parse(config.line.loginUrl);
  const fullUrl = isLocalhost
    ? `http://${req.get('host')}${fullUrlObj.path}`
    : config.line.loginUrl;
  // const state =
  //   (req.cookies && req.cookies.state) ||
  //   crypto.randomBytes(20).toString('hex');
  // // console.log('Setting state cookie for verification:', state);
  // // console.log('Need a secure cookie (i.e. not on localhost)?', secureCookie);
  // res.cookie('from', req.query.from, {
  //   maxAge: 3600000,
  //   secure: !isLocalhost,
  //   httpOnly: true,
  // });
  // res.cookie('state', state, {
  //   maxAge: 3600000,
  //   secure: !isLocalhost,
  //   httpOnly: true,
  // });

  const state =
    (req.cookies && req.cookies.state) ||
    `${crypto.randomBytes(20).toString('hex')}|||${req.query.from}`;
  res.cookie('state', state, {
    maxAge: 3600000,
    secure: !isLocalhost,
    httpOnly: true,
  });

  const redirectUri = oauth2.authorizationCode.authorizeURL({
    redirect_uri: fullUrl.replace(OAUTH_REDIRECT_PATH, OAUTH_CALLBACK_PATH),
    scope: OAUTH_SCOPES,
    state: state,
  });
  // console.log('Redirecting to:', redirectUri);
  // res.status(200).send(redirectUri);
  res.redirect(redirectUri);
});

/**
 * Exchanges a given Instagram auth code passed in the 'code' URL query parameter for a Firebase auth token.
 * The request also needs to specify a 'state' query parameter which will be checked against the 'state' cookie to avoid session Fixation attacks.
 * This is meant to be used by Web Clients.
 */
router.get(OAUTH_CALLBACK_PATH, (req, res) => {
  const isLocalhost = (req.get('host') || '').indexOf('localhost') > -1;
  const fullUrlObj = url.parse(config.line.loginUrl);
  const fullUrl = isLocalhost
    ? `http://${req.get('host')}${fullUrlObj.path}`
    : config.line.loginUrl;

  // console.log('Received state cookie:', req.cookies);
  // console.log('Received state query parameter:', req.query.state);
  if (req.cookies && !req.cookies.state) {
    res
      .status(400)
      .send(
        'State cookie not set or expired. Maybe you took too long to authorize. Please try again.',
      );
  } else if (req.cookies && req.cookies.state !== req.query.state) {
    res.status(400).send('State validation failed');
  }
  // console.log('Received auth code:', req.query.code);
  oauth2.authorizationCode
    .getToken({
      code: req.query.code,
      redirect_uri: fullUrl.replace(OAUTH_REDIRECT_PATH, OAUTH_CALLBACK_PATH),
    })
    .then(results => {
      const payload = jwt.decode(results.id_token);
      return {
        lineUserID: payload.sub,
        profilePic: payload.picture,
        userName: payload.name,
        email: payload.email,
        accessToken: results.access_token,
      };
    })
    .then(results => {
      // The UID we'll assign to the user.
      const uid = `LINE: ${results.lineUserID}`;
      if (results.email) {
        return rp({
          method: 'POST',
          uri: `${restUrl}/verifyPassword?key=${config.apiKey}`,
          headers: { 'Content-Type': 'application/json' },
          body: {
            email: results.email,
            password: results.lineUserID,
            returnSecureToken: true,
          },
          json: true,
        })
          .then(result => ({
            uid: result.localId,
            ...results,
          }))
          .catch(err => {
            switch (err.error.error.message) {
              case 'INVALID_PASSWORD':
                // duplicate
                return admin
                  .auth()
                  .getUserByEmail(results.email)
                  .then(res => ({
                    uid: res.uid,
                    ...results,
                  }));
              case 'EMAIL_NOT_FOUND':
                // create new user
                return rp({
                  method: 'POST',
                  uri: `${restUrl}/signupNewUser?key=${config.apiKey}`,
                  headers: { 'Content-Type': 'application/json' },
                  body: {
                    email: results.email,
                    password: results.lineUserID,
                    returnSecureToken: true,
                  },
                  json: true,
                }).then(result => ({
                  uid: result.localId,
                  ...results,
                }));
            }
            throw err.error.error;
          })
          .then(result => {
            const deleteDocTask = db
              .collection('accounts')
              .doc(uid)
              .delete();
            const deleteUserTask = admin
              .auth()
              .deleteUser(uid)
              .catch(error => {
                if (error.code === 'auth/user-not-found') {
                  return;
                }
                throw error;
              });

            return Promise.all([deleteUserTask, deleteDocTask]).then(() => ({
              uid: result.uid,
              ...results,
            }));
          });
      } else {
        return {
          uid,
          ...results,
        };
      }
    })
    .then(results => {
      // Save the access token to the Firebase Realtime Database.
      const email = results.email ? { email: results.email } : {};
      const updateDocTask = db
        .collection('accounts')
        .doc(results.uid)
        .set(
          {
            ...email,
            accessToken: results.accessToken,
            lineUserID: results.lineUserID,
            line_photo: results.profilePic,
          },
          { merge: true },
        );

      // Create or update the user account.
      const updateUserTask = admin
        .auth()
        .updateUser(results.uid, {
          displayName: results.userName,
          photoURL: results.profilePic,
          password: results.lineUserID,
        })
        .catch(error => {
          // If user does not exists we create it.
          if (error.code === 'auth/user-not-found') {
            return admin.auth().createUser({
              uid: results.uid,
              displayName: results.userName,
              photoURL: results.profilePic,
            });
          }
          throw error;
        });

      // Wait for all async task to complete then generate and return a custom auth token.
      // Then create a Firebase custom auth token
      return Promise.all([updateUserTask, updateDocTask]).then(() =>
        admin.auth().createCustomToken(results.uid),
      );
    })
    .then(firebaseToken => {
      // Serve an HTML page that signs the user in and updates the user profile.
      // if (req.cookies.from !== 'undefined') {
      //   res.redirect(`${req.cookies.from}/${firebaseToken}`);
      // } else {
      //   res.send(signInFirebaseTemplate(firebaseToken));
      // }
      if (req.cookies.state) {
        res.redirect(`${req.cookies.state.split('|||')[1]}/${firebaseToken}`);
      } else {
        res.send(signInFirebaseTemplate(firebaseToken));
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err.message);
    });
});

// http://localhost:9000/.netlify/functions/index/delete_anonymous_users
router.get('/delete_anonymous_users', (undefined, res) => {
  const currentTime = new Date();
  let count = 0;
  const deleteAnonymousUsers = nextPageToken => {
    admin
      .auth()
      .listUsers(20, nextPageToken)
      .then(listUsersResult => {
        listUsersResult.users.forEach(userRecord => {
          const lastSignInTime = new Date(userRecord.metadata.lastSignInTime);
          if (
            userRecord.providerData.length === 0 &&
            !userRecord.uid.includes('LINE: ') &&
            currentTime - lastSignInTime > 86400000
          ) {
            // this user is anonymous
            admin
              .auth()
              .deleteUser(userRecord.uid)
              .then(() => {
                count += 1;
                console.log('Successfully deleted user');
              })
              .catch(error => {
                console.log('Error deleting user:', error);
              });
          }
        });
        if (listUsersResult.pageToken) {
          // List next batch of users.
          deleteAnonymousUsers(listUsersResult.pageToken);
        } else {
          res.send(`success: ${count}`);
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).send(err.message);
      });
  };

  deleteAnonymousUsers();
});

router.post('/fb_deletion_callback', (req, res) => {
  function base64decode(data) {
    while (data.length % 4 !== 0) {
      data += '=';
    }
    data = data.replace(/-/g, '+').replace(/_/g, '/');
    return new Buffer(data, 'base64').toString('utf-8');
  }

  var encoded_data = req.split('.', 2);
  // decode the data
  var sig = encoded_data[0];
  var json = base64decode(encoded_data[1]);
  var data = JSON.parse(json);
  if (!data.algorithm || data.algorithm.toUpperCase() != 'HMAC-SHA256') {
    throw Error(
      'Unknown algorithm: ' + data.algorithm + '. Expected HMAC-SHA256',
    );
  }
  var expected_sig = crypto
    .createHmac('sha256', config.fb.clientSecret)
    .update(encoded_data[1])
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace('=', '');
  if (sig !== expected_sig) {
    res
      .status(500)
      .send('Invalid signature: ' + sig + '. Expected ' + expected_sig);
  }
  res.json(data);
});

app.use('/.netlify/functions/index', router);

/**
 * Generates the HTML template that signs the user in Firebase using the given token and closes the popup.
 */
function signInFirebaseTemplate(token) {
  return `
		<script src="https://www.gstatic.com/firebasejs/4.8.1/firebase.js"></script>
		<script>
			var token = '${token}';
			var config = {
				apiKey: '${config.apiKey}'
			};
			var app = firebase.initializeApp(config);
			app.auth().signInWithCustomToken(token).then(function(res) {
				alert(token);console.log(res);
			});
		</script>`;
}

exports.api = functions.https.onRequest(app);
exports.handler = serverless(app);
