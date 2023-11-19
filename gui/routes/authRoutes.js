const express = require('express');
const router = express.Router();
const db = require('./database.js');
const fileRoutes = require('./files.js');
const path = require('path');
const publicDir = path.resolve(__dirname + "/../public/") + "/"; // Turns relative path to absolute path. Express relative path is malicious

router.use(async (req, res, next) => {
	const user = req.cookies.user;
	const sessionId = req.cookies.sessionId;

	if (sessionId) {
		const sessionExists = await db.checkSessionId(user, sessionId);
		if (sessionExists) {
			await db.setAuthCookie(user, res, sessionId);
			next();
			return;
		}
	}

	res.redirect('/');
});

router.post('/logout', async (req, res) => {
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

router.get('/:type(css|js|images)/:file', (req, res) => {
	const type = req.params.type;
	const file = req.params.file;
	res.sendFile(file, { root: publicDir + type });
});

router.get('/:file(home|about)', (req, res) => {
	const file = req.params.file + '.html';
	res.sendFile(file, { root: publicDir });
});

fileRoutes(router);

module.exports = router;

