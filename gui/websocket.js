const { WebSocketServer } = require('ws');
const crypto = require('crypto');
//const cookie = require('cookie');
const db = require('./routes/database.js');

const wss = new WebSocketServer({ noServer: true });

let connections = [];

function connect(ws) {
	const id = crypto.randomBytes(16).toString('hex');
	const connection = { id: id, alive: true, ws: ws };
	connections.push(connection);

	function broadcastMessage(senderId, data) {
		connections.forEach(c => {
			if (c.id !== senderId) {
				c.ws.send(data);
			}
		});
	}

	ws.on('message', data => {
		broadcastMessage(connection.id, data);
	});

	ws.on('close', () => {
		connections = connections.filter(c => c.id !== connection.id);
	});

	ws.on('error', err => {
		console.error('WebSocket error:', err);
	});

	ws.on('pong', () => {
		connection.alive = true;
	});
};

wss.on('connection', (ws, req) => {
	try {
		//const parsedCookies = cookie.parse(req.headers.cookie || '');
        //const sessionId = parsedCookies.sessionId;
		const sessionId = req.cookies.sessionId;

		if (db.checkSessionId(sessionId)) {
			connect(ws);
		} else {
			ws.close();
		}
	} catch (error) {
		ws.close();
	}
});

const interval = setInterval(() => {
	connections.forEach(c => {
		if (!c.alive) {
			c.ws.terminate();
		} else {
			try {
				c.alive = false;
				c.ws.ping();
			} catch (error) {
				console.error('Error sending ping:', error);
			}
		}
	});

	// Clear the interval if there are no connections
	if (connections.length === 0) {
		clearInterval(interval);
	}
}, 10000);

module.exports = wss;

