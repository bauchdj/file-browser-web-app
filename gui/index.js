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

// Trust headers that are forwarded from the proxy so we can determine IP addresses
app.set('trust proxy', true);

// Default files accessible without login
app.use('/css/main.css', express.static(__dirname + '/public/css/main.css'));
app.use('/css/login.css', express.static(__dirname + '/public/css/login.css'));
app.use('/js/login.js', express.static(__dirname + '/public/js/login.js'));
app.use('/images/file-browser-icon.png', express.static(__dirname + '/public/images/file-browser-icon.png'));
app.use('/favicon.ico', express.static(__dirname + '/public/favicon.ico'));

app.get(['/', '/login'], (req, res) => {
	res.sendFile('login.html', { root: __dirname + '/public' });
});

async function setAuthCookie(user, res, sessionId) {
	const maxAge = 3600000;
	sessionId = await db.updateSessionId(user, maxAge, sessionId);

	res.cookie('user', user, { secure: true, httpOnly: true, sameSite: 'strict', maxAge: maxAge });
	res.cookie('sessionId', sessionId, { secure: true, httpOnly: true, sameSite: 'strict', maxAge: maxAge });
}

app.post('/create/user', async (req, res) => {
	const username = req.body.username;
	const pwd = req.body.password;

	// Idea: require patten at end of password for future security
	// if (pwd.match(/regex expr/) cont... else NOPE)

	const userCreated = await db.createUser(username, pwd);

	if (userCreated) {
		await setAuthCookie(username, res);
		res.json({ success: true, message: 'User creation successful' });
	} else {
		res.status(409).send({ success: false, message: 'Existing user' });
	}
});

app.post('/login', async (req, res) => {
	const username = req.body.username;
	const pwd = req.body.password;

	const promise = await db.checkUserLogin(username, pwd);

	if (promise.success) {
		await setAuthCookie(username, res);
		res.json({ success: true, message: 'Login successful' });
	} else {
		res.status(401).send({ success: false, message: 'Invalid credentials' });
	}
});


async function checkAuth(req, res, next) {
	const user = req.cookies.user;
	const sessionId = req.cookies.sessionId;

	if (sessionId) {
		const sessionExists = await db.checkSessionId(user, sessionId);
		if (sessionExists) {
			await setAuthCookie(user, res, sessionId);
			next();
			return;
		}
	}

	res.redirect('/');
}

app.post('/logout', checkAuth, async (req, res) => {
	const user = req.cookies.user;
	const sessionId = req.cookies.sessionId;

	const cleared = await db.clearSessionId(user, sessionId);

	if (cleared) {
		res.clearCookie('user');
		res.clearCookie('sessionId');
		res.json({ success: true, message: 'Logout successful' });
		return;
	}

	res.status(500).json({ success: false, message: 'Logout failed' });
});

app.get('/:type(css|js|images)/:file', checkAuth, (req, res) => {
	const type = req.params.type;
	const file = req.params.file;
	res.sendFile(file, { root: __dirname + '/public/' + type });
});

app.get('/:file(home|about)', checkAuth, (req, res) => {
	const file = req.params.file + '.html';
	res.sendFile(file, { root: __dirname + '/public' });
});

fileRoutes.fileRoutes(app, checkAuth);

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
