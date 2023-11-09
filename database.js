const { MongoClient } = require('mongodb');
const config = require("./db-config.json");

const url = `mongodb+srv://${config.username}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);

