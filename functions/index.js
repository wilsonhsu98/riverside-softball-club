const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = require('./config.json');
admin.initializeApp(Object.assign({}, functions.config().firebase, {
	credential: admin.credential.cert(config.serviceAccount)
}));

const db = admin.firestore();
const timestamp = admin.firestore.FieldValue.serverTimestamp();

exports.import_game = functions.https.onRequest((req, res) => {
	const body = req.body;
	const game = body.game;
	const teddySummary = body.summary.find(item => item['場次'] === game);
	const parseResult = parseGame(body.rawdata);
	db.collection('games').doc(game).set({
			orders: parseResult.orders,
			errors: parseResult.errors,
			result: ['win', 'lose', 'tie', ''][
						['勝', '敗', '和', ''].indexOf(teddySummary ? teddySummary['結果'] : 3)
					],
			year: teddySummary ? teddySummary['年度'] : '',
			season: teddySummary ? teddySummary['季度'] : '',
			opponent: teddySummary ? teddySummary['對手'] : '',
			league: teddySummary ? teddySummary['聯盟'] : '',
			coach: teddySummary ? teddySummary['教練'] : '',
			place: teddySummary ? teddySummary['休息區'] : '',
			group: teddySummary ? teddySummary['組別'] : '',
			timestamp,
		}).then(writeResult => {
			res.json(writeResult);
		});
});

const contentMapping = {
	'1H': '1H',
	'2H': '2H',
	'3H': '3H',
	'HR': 'HR',
	'飛球': 'FO',
	'滾地': 'GO',
	'BB': 'BB',
	'K': 'K',
	'E': 'E',
	'野選': 'FC',
	'犧飛': 'SF',
	'雙殺': 'DP',
	'三殺': 'TP',
};
const parseGame = function(arr) {
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
				} else if (row + 1 < arr.length && arr[row + 1][col] === '' && arr[row + 1][col + 2] === 'R') {
					run = arr[row + 1][nameCol];
				}
				result.push({
					order: order++,
					inn: innArray.indexOf(arr[0][col]),
					name: arr[row][nameCol],
					content: contentMapping[arr[row][col]],
					r: run,
					rbi: arr[row][col + 1],
					_row: row
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
						row = result[result.length - 1]._row + 1
					}
				} else {
					row = 1;
				}
			}
		}
	}
	return {
		orders: result.map(function(item) {
			delete item._row;
			return item;
		}),
		errors: errorArr,
	};
};



// Line OAuth 2 setup
const credentials = {
	client: {
		id: config.line.clientId,
		secret: config.line.clientSecret
	},
	auth: {
		tokenHost: 'https://api.line.me',
		tokenPath: '/oauth2/v2.1/token',
		authorizeHost: 'https://access.line.me',
		authorizePath: '/oauth2/v2.1/authorize'
	}
};
const profileUrl = 'https://api.line.me/v2/profile';
const oauth2 = require('simple-oauth2').create(credentials);
const rp = require('request-promise');
const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

// Path to the OAuth handlers.
const OAUTH_REDIRECT_PATH = '/line_oauth';
const OAUTH_CALLBACK_PATH = '/line_oauth_callback';
// scopes requested.
const OAUTH_SCOPES = 'openid profile';

const app = express();
app.enable('trust proxy');
app.use(express.static('public'));
app.use(express.static('node_modules/instafeed.js'));
app.use(cookieParser());

/**
 * Redirects the User to the Instagram authentication consent screen. Also the 'state' cookie is set for later state
 * verification.
 */
app.get(OAUTH_REDIRECT_PATH, (req, res) => {
	const state = (req.cookies && req.cookies.state) || crypto.randomBytes(20).toString('hex');
	console.log('Setting state cookie for verification:', state);
	const secureCookie = req.get('host').indexOf('localhost:') !== 0;
	console.log('Need a secure cookie (i.e. not on localhost)?', secureCookie);
	res.cookie('state', state, {maxAge: 3600000, secure: secureCookie, httpOnly: true});
	res.cookie('from', req.query.from, {maxAge: 3600000, secure: secureCookie, httpOnly: true});
	const redirectUri = oauth2.authorizationCode.authorizeURL({
		redirect_uri: `${req.protocol}://${req.get('host')}/api${OAUTH_CALLBACK_PATH}`,
		scope: OAUTH_SCOPES,
		state: state
	});
	console.log('Redirecting to:', redirectUri);
	res.redirect(redirectUri);
});

/**
 * Exchanges a given Instagram auth code passed in the 'code' URL query parameter for a Firebase auth token.
 * The request also needs to specify a 'state' query parameter which will be checked against the 'state' cookie to avoid
 * Session Fixation attacks.
 * This is meant to be used by Web Clients.
 */
app.get(OAUTH_CALLBACK_PATH, (req, res) => {
	console.log('Received state cookie:', req.cookies && req.cookies.state);
	console.log('Received state query parameter:', req.query.state);
	if (req.cookies && !req.cookies.state) {
		res.status(400).send('State cookie not set or expired. Maybe you took too long to authorize. Please try again.');
	} else if (req.cookies && req.cookies.state !== req.query.state) {
		res.status(400).send('State validation failed');
	}
	console.log('Received auth code:', req.query.code);
	let accessToken = '';
	oauth2.authorizationCode.getToken({
		code: req.query.code,
		redirect_uri: `${req.protocol}://${req.get('host')}/api${OAUTH_CALLBACK_PATH}`,
	}).then(results => {
		accessToken = results.access_token;
		return rp({ uri: profileUrl, headers: { Authorization: `Bearer ${results.access_token}` }, json: true });
	}).then(results => {
		console.log('Auth code exchange result received:', results);
		// We have an line access token and the user identity now.
		const lineUserID = results.userId;
		const profilePic = results.pictureUrl;
		const userName = results.displayName;

		// Create a Firebase account and get the Custom Auth Token.
		createFirebaseAccount(lineUserID, userName, profilePic, accessToken).then(firebaseToken => {
			// Serve an HTML page that signs the user in and updates the user profile.
			if (req.cookies.from) {
				res.redirect(`${req.cookies.from}/${firebaseToken}`);
			} else {
				res.send(signInFirebaseTemplate(firebaseToken, userName, profilePic, accessToken));
			}
		});
	}).catch(err => {
		console.log(err)
		res.status(500).send(err.message);
	});
});


/**
 * Creates a Firebase account with the given user profile and returns a custom auth token allowing
 * signing-in this account.
 * Also saves the accessToken to the datastore at /instagramAccessToken/$uid
 *
 * @returns {Promise<string>} The Firebase custom auth token in a promise.
 */
function createFirebaseAccount(lineUserID, displayName, photoURL, accessToken) {
	// The UID we'll assign to the user.
	const uid = `LINE: ${lineUserID}`;

	// Save the access token to the Firebase Realtime Database.
	const databaseTask = db.collection('accounts').doc(uid).set({ accessToken }, { merge: true });

	// Create or update the user account.
	const userCreationTask = admin.auth().updateUser(uid, {
		displayName: displayName,
		photoURL: photoURL
	}).catch(error => {
		// If user does not exists we create it.
		if (error.code === 'auth/user-not-found') {
			return admin.auth().createUser({
				uid: uid,
				displayName: displayName,
				photoURL: photoURL
			});
		}
		throw error;
	});

	// Wait for all async task to complete then generate and return a custom auth token.
	return Promise.all([userCreationTask, databaseTask]).then(() => {
		// Create a Firebase custom auth token.
		const token = admin.auth().createCustomToken(uid);
		console.log('Created Custom token for UID "', uid, '" Token:', token);
		return token;
	});
}

/**
 * Generates the HTML template that signs the user in Firebase using the given token and closes the
 * popup.
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
				alert();console.log(res);
			});
		</script>`;
}

exports.api = functions.https.onRequest(app);