const bcrypt = require('bcrypt');
const { MongoClient } = require("mongodb");
const config = require("./db-config.json");

const uri = `mongodb+srv://${config.username}:${config.password}@${config.hostname}`;
const client = new MongoClient(uri);

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
		await client.connect();
		const db = client.db("Cluster0");
		const collection = db.collection("users");
		const user = await collection.findOne({ username: username });
		return user;
	} catch (err) {
		console.error("Error finding user:", err);
		throw err; // Re-throw the error to be caught by the caller
	}
}

async function checkUserLogin(username, password) {
	try {
		const user = await findUserByUsername(username);
		if (user) {
			const isMatch = await checkPassword(password, user.password);
			
			if (isMatch) {
				//return { success: true, userId: user._id };
				return { success: true };
			} else {
				return { success: false };
			}
		}
	} catch (err) {
		console.error("Error checking user login:", err);
		//throw err; // Re-throw the error to be caught by the caller
	}
}

async function createUser(username, password) {
	try {
		const pwd = await hashPassword(password);
		await client.connect();
		const db = client.db("Cluster0");
		const collection = db.collection("users");
		const document = { username: username, password: pwd };
		await collection.insertOne(document);
	} catch (err) {
		console.error("Error creating user", err);
		// throw err;
	}
}

createUser("guest", "2bemyguestlogin");

module.exports = {
	createUser,
	checkUserLogin
};

process.on("SIGINT", async () => {
	await client.close();
	console.log("MongoDB client disconnected on app termination");
	process.exit(0);
});

