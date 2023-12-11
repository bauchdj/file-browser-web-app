const express = require('express');
const cookie = require('cookie');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRouter = require('./routes/authRoutes.js');
const nonAuthRouter = require('./routes/nonAuthRoutes.js');
const wss = require('./websocket.js');

const app = express();
const numOfProxies = 1;
app.set('trust proxy', numOfProxies);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
	req.cookies = cookie.parse(req.headers.cookie || '');
	next();
});

app.use(helmet({
	contentSecurityPolicy: {
		directives: {
			"script-src": ["'self'", "https://cdn.jsdelivr.net/"],
			"script-src-attr": ["'unsafe-inline'"],
			"connect-src": ["'self'", "https://api.chucknorris.io/jokes/"],
		},
	},
}));

app.use(rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 1000 // limit each IP to 100 requests per windowMs
}));

const port = process.argv.length > 2 ? process.argv[2] : 3000;

const serviceName = process.argv.length > 3 ? process.argv[3] : 'file-browser-web-app';

app.get('/ip', (request, response) => response.send(request.ip));

//app.use(express.static('public'));
app.use('/assets/:file(home|about)', (req, res) => {
	const file = req.params.file;
	res.sendFile(file, { root: publicDir + 'dist/assets' });
	//res.sendFile(file, { root: publicDir + 'dist' });
});
app.use('/css/main.css', express.static(__dirname + '/public/css/main.css'));
app.use('/favicon.ico', express.static(__dirname + '/public/favicon.ico'));
app.use('/images/file-browser-icon.png', express.static(__dirname + '/public/images/file-browser-icon.png'));

app.use(nonAuthRouter);
app.use(authRouter);

httpServer = app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});

httpServer.on('upgrade', (req, socket, head) => {
	req.cookies = cookie.parse(req.headers.cookie || '');
	wss.handleUpgrade(req, socket, head, ws => {
		wss.emit('connection', ws, req);
	});
});

