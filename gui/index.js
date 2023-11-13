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

// Serve up the static content
//app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
	res.sendFile('index.html', { root: __dirname + '/public' });
});

app.post('/login', async function (req, res) {
	const username = req.body.username;
	const pwd = req.body.password;

	const promise = await db.checkUserLogin(username, pwd);

	if (promise.success) {
		res.cookie('isLoggedIn', 'true', { httpOnly: true, maxAge: 3600000 });
		res.redirect('/home');
		return;
	}

	res.redirect('/');
});

function checkAuth(req, res, next) {
	if (req.cookies.isLoggedIn === 'true') {
		next();
	} else {
		res.redirect('/');
	}
}

app.get('/home', checkAuth, (req, res) => {
	res.sendFile('home.html', { root: __dirname + '/public' });
});

fileRoutes.fileRoutes(app);

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
