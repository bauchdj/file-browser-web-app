const bcrypt = require('bcrypt');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require("mongodb");
const config = require("./db-config.json");

const uri = `mongodb+srv://${config.username}:${config.password}@${config.hostname}`;
const client = new MongoClient(uri);
const db = client.db("Cluster0");
const usersCollection = db.collection("users");
const sessionsCollection = db.collection("sessions");

const maxAge = 3600000;
const sessions = new Map();

// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
	await client.connect();
	await sessionsCollection.createIndex({ "createdAt": 1 }, { expireAfterSeconds: maxAge / 1000 });
	await db.command({ ping: 1 });
})().catch((ex) => {
	console.log(`Unable to connect to database with ${uri} because ${ex.message}`);
	process.exit(1);
});

async function hashPassword(password) {
	const saltRounds = 10; // This is a cost factor for hashing
	const hashedPassword = await bcrypt.hash(password, saltRounds);
	return hashedPassword;
}

async function checkPassword(inputPassword, storedHashedPassword) {
	return await bcrypt.compare(inputPassword, storedHashedPassword);
}

async function findUserByUsername(username) {
	try {
		const user = await usersCollection.findOne({ username: username });
		return user;
	} catch (err) {
		console.error("Error finding user:", err);
		return false;
	}
}

async function checkUserLogin(username, password) {
	try {
		const user = await findUserByUsername(username);
		if (user && user.password) {
			const isMatch = await checkPassword(password, user.password);
			if (isMatch) {
				return { success: true };
			}
		}

		return { success: false };
	} catch (err) {
		console.error("Error checking user login:", err);
		return false;
	}
}

function removeSessionId(sessionId) {
	sessions.delete(sessionId);
}

async function clearSessionIdOnLogout(sessionId) {
	try {
		clearTimeout(sessions.get(sessionId).timeoutFunction);
		removeSessionId(sessionId);
		await sessionsCollection.deleteOne({ sessionId: sessionId });
		return true;
	} catch (err) {
		return false;
	}
}

async function updateSessionId(username, sessionId) {
	try {
		function setSessionIdBasedOnTime(currentTime) {
			if (sessions.get(sessionId)) {
				sessions.get(sessionId).lastActivity = currentTime;
			} else {
				sessions.set(sessionId, { lastActivity: currentTime });
			}

			if (sessions.get(sessionId).timeoutFunction) {
				clearTimeout(sessions.get(sessionId).timeoutFunction);
			}

			sessions.get(sessionId).timeoutFunction = setTimeout(() => {
				removeSessionId(sessionId);
			}, maxAge);

			const sessionUpdate = { $set: { sessionId: sessionId, createdAt: currentTime } };
			sessionsCollection.updateOne({ username: username }, sessionUpdate, { upsert: true });
		}

		async function getLastActivity() {
			if (sessions.get(sessionId)) {
				return sessions.get(sessionId).lastActivity;
			}

			const data = await sessionsCollection.findOne({ username: username, sessionId: sessionId });
			if (data === null) { // On logout -> causing websocket close, it is null
				return false;
			}

			const date = new Date(data.createdAt);
			return date;
		}

		const currentTime = new Date();

		if (sessionId === undefined) {
			sessionId = crypto.randomBytes(16).toString('hex');
			setSessionIdBasedOnTime(currentTime);
		} else {
			const lastActivity = await getLastActivity(); // Uses sessions Map or queries MongoDB

			if (lastActivity === false) {
				return false;
			}

			if ((currentTime - lastActivity) > 5000) {
				setSessionIdBasedOnTime(currentTime);
			}
		}

		return sessionId;
	} catch (err) {
		console.error("Error updating user session:", err);
		return false;
	}
}

async function setAuthCookie(user, res, sessionId) {
	sessionId = await updateSessionId(user, sessionId);

	res.cookie('user', user, { secure: true, httpOnly: true, sameSite: 'strict', maxAge: maxAge });
	res.cookie('sessionId', sessionId, { secure: true, httpOnly: true, sameSite: 'strict', maxAge: maxAge });
}

async function checkSessionId(username, sessionId) {
	try {
		if (sessions.get(sessionId)) {
			return true;
		}

		const user = await sessionsCollection.findOne({ username: username, sessionId: sessionId } );

		if (user && user.sessionId) {
			return true;
		}

		return false;
	} catch (err) {
		console.error("Error checking user session:", err);
		return false;
	}
}

async function userPathExists(path) {
	try {
		await fs.access(path, fs.constants.F_OK);
		return true;
	} catch (err) {
		return false;
	}
}

async function createUser(username, password) {
	const basePath = path.resolve(__dirname + "/../../") + "/"; // Turns relative path to absolute path. Express relative path is malicious
	const userPath = basePath + "users/" + username + "/";
	if (await userPathExists(userPath)) return false;

	const userExists = await findUserByUsername(username);
	if (userExists) return false;

	try {
		await fs.mkdir(userPath);
		await fs.mkdir(userPath + ".trash/");

		const pwd = await hashPassword(password);
		const document = { username: username, password: pwd };
		await usersCollection.insertOne(document);

		return true;
	} catch (err) {
		console.error("Error creating user", err);
	}

	return false;
}

process.on("SIGINT", async () => {
	await client.close();
	console.log("\nMongoDB client disconnected on app termination");
	process.exit(0);
});

module.exports = {
	checkUserLogin,
	clearSessionIdOnLogout,
	updateSessionId,
	setAuthCookie,
	checkSessionId,
	createUser,
};

