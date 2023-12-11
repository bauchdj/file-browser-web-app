const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('./database.js');
const path = require('path');
const publicDir = path.resolve(__dirname + "/../public/") + "/"; // Turns relative path to absolute path. Express relative path is malicious

router.get(['/', '/login'], (req, res) => { res.sendFile('index.html', { root: publicDir + 'dist' }); });
router.get('/css/login.css', (req, res) => { res.sendFile('login.css', { root: publicDir + 'css' }); });
router.get('/js/login.js', (req, res) => { res.sendFile('login.js', { root: publicDir + 'js' }); });

router.post('/create/user', [
	body('username')
		.isLength({ min: 2, max: 30 })
		.withMessage('Username must be between 2 and 30 characters long')
		.trim()
		.escape(),

	body('password')
		.isLength({ min: 5, max: 30 })
		.withMessage('Password must be between 5 and 30 characters long')
		.matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/)
		.withMessage('Password must contain at least one letter and one number'),

], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ success: false, message: errors.array().map(err => err.msg) });
	}

	const username = req.body.username;
	const password = req.body.password;

	const specialPattern = /.*@#!$/;
	if (!specialPattern.test(password)) {
		return res.status(400).json({ success: false, message: 'Invalid input' });
	}

	const pwd = password.replace(/@#!$/, '');

	const userCreated = await db.createUser(username, pwd);

	if (userCreated) {
		await db.setAuthCookie(username, res);
		res.json({ success: true, message: 'User creation successful' });
	} else {
		res.status(409).send({ success: false, message: 'Existing user' });
	}
});

router.post('/login', async (req, res) => {
	const username = req.body.username;
	const pwd = req.body.password;

	const promise = await db.checkUserLogin(username, pwd);

	if (promise.success) {
		await db.setAuthCookie(username, res);
		res.json({ success: true, message: 'Login successful' });
	} else {
		res.status(401).send({ success: false, message: 'Invalid credentials' });
	}
});

module.exports = router;
