const { WebSocketServer } = require('ws');
const db = require('./routes/database.js');

const wss = new WebSocketServer({ noServer: true });

const connections = new Map();

function connect(ws, id) {
	const connection = { id, alive: true, ws };
	connections.set(id, connection);

	ws.on('message', data => {
		console.log(data);
	});

	ws.on('close', () => {
		connections.delete(id);
		console.log(`Connection closed: ${id}`);
	});

	ws.on('error', err => {
		console.error('WebSocket error:', err);
		connections.delete(id);
	});

	ws.on('pong', () => {
		connection.alive = true;
	});

	ws.send('Connection established successfully.');
}

wss.on('connection', (ws, req) => {
	try {
		const sessionId = req.cookies.sessionId;
		if (db.checkSessionId(sessionId)) {
			connect(ws, sessionId);
		} else {
			ws.close();
		}
	} catch (error) {
		ws.close();
	}
});

const interval = setInterval(() => {
	connections.forEach((connection, id) => {
		if (!connection.alive) {
			connection.ws.terminate();
			connections.delete(id);
		} else {
			connection.alive = false;
			connection.ws.ping();
		}
	});

	if (connections.size === 0) {
		clearInterval(interval);
	}
}, 10000);

module.exports = wss;

