const express = require('express');
const cookieParser = require('cookie-parser');
const db = require('./database.js');
const fileRoutes = require('./routes/files.js');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// The service port defaults to 3000 or is read from the program arguments
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// Text to display for the service name
const serviceName = process.argv.length > 3 ? process.argv[3] : 'file-browser-web-app';

// Default files accessible without login
app.use('/css/main.css', express.static(__dirname + '/public/css/main.css'));
app.use('/css/index.css', express.static(__dirname + '/public/css/index.css'));
app.use('/images/file-browser-icon.png', express.static(__dirname + '/public/images/file-browser-icon.png'));
app.use('/favicon.ico', express.static(__dirname + '/public/favicon.ico'));

app.get('/', (req, res) => {
	res.sendFile('index.html', { root: __dirname + '/public' });
});

app.post('/login', async function (req, res) {
	const username = req.body.username;
	const pwd = req.body.password;

	const promise = await db.checkUserLogin(username, pwd);

	if (promise.success) {
		//const sessionId = generateNewSessionId();
		res.cookie('isLoggedIn', 'true', { httpOnly: true, secure: true, maxAge: 3600000, sameSite: 'lax' });
		res.redirect('/home');
	} else {
		res.redirect('/');
	}
});

function checkAuth(req, res, next) {
	//const sessionId = req.cookies.sessionId;
	//if (sessionId && isValidSession(sessionId)) {
	if (req.cookies.isLoggedIn === 'true') {
		next();
	} else {
		res.redirect('/');
	}
}

app.get('/:type(css|js|images)/:file', checkAuth, (req, res) => {
	const type = req.params.type;
	const file = req.params.file;
	res.sendFile(file, { root: __dirname + '/public/' + type });
});

app.get('/:file(home|about)', checkAuth, (req, res) => {
	const file = req.params.file + '.html';
	res.sendFile(file, { root: __dirname + '/public' });
});

fileRoutes.fileRoutes(app);

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
