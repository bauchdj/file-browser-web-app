const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRouter = require('./routes/authRoutes.js');
const nonAuthRouter = require('./routes/nonAuthRoutes.js');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet.contentSecurityPolicy({
    directives: {
        "script-src": ["'self'", "https://cdn.jsdelivr.net/"]
    }
}));
app.use(rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100 // limit each IP to 100 requests per windowMs
}));

const port = process.argv.length > 2 ? process.argv[2] : 3000;

const serviceName = process.argv.length > 3 ? process.argv[3] : 'file-browser-web-app';

app.use('/css/main.css', express.static(__dirname + '/public/css/main.css'));
app.use('/favicon.ico', express.static(__dirname + '/public/favicon.ico'));

app.use(nonAuthRouter);
app.use(authRouter);

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
