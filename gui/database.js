const bcrypt = require('bcrypt');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require("mongodb");
const config = require("./db-config.json");

const uri = `mongodb+srv://${config.username}:${config.password}@${config.hostname}`;
const client = new MongoClient(uri);
const db = client.db("Cluster0");
const collection = db.collection("users");

const sessionIdHash = {};

// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
	await client.connect();
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
		const user = await collection.findOne({ username: username });
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

async function removeSessionId(username, sessionId) {
	try {
		delete sessionIdHash[sessionId];
		await collection.updateOne({ username: username }, { $unset: { sessionId: "" } });
		console.log(`Session ID for ${username} has been cleared`);
		return true;
	} catch (err) {
		console.error("Error removing user session:", err);
		return false;
	}
}

async function clearSessionId(username, sessionId) {
	clearTimeout(sessionIdHash[sessionId]);
	return await removeSessionId(username, sessionId);
}

async function updateSessionId(username, sessionIdLifetime, sessionId) {
	try {
		if (sessionId === undefined) {
			function generateNewSessionId() {
				return crypto.randomBytes(16).toString('hex');
			}
			sessionId = generateNewSessionId();
			const result = await collection.updateOne({ username: username }, { $set: { sessionId: sessionId } });
		}

		sessionIdHash[sessionId] = setTimeout(async () => {
			await removeSessionId(username, sessionId);
		}, sessionIdLifetime);

		return sessionId;
	} catch (err) {
		console.error("Error updating user session:", err);
		return false;
	}
}

async function checkSessionId(username, sessionId) {
	try {
		if (sessionIdHash[sessionId]) {
			return true;
		}

		const user = await collection.findOne({ username: username, sessionId: sessionId } );

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
	const basePath = path.resolve(__dirname + "/../") + "/"; // Turns relative path to absolute path. Express relative path is malicious
	const userPath = basePath + "users/" + username + "/";
	if (await userPathExists(userPath)) return false;

	const userExists = await findUserByUsername(username);
	if (userExists) return false;

	try {
		await fs.mkdir(userPath);

		const pwd = await hashPassword(password);
		const document = { username: username, password: pwd };
		await collection.insertOne(document);

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
	createUser,
	checkUserLogin,
	updateSessionId,
	checkSessionId,
	clearSessionId,
};

