function getWebSocketUrl() {
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	const host = window.location.hostname;
	const port = window.location.port ? `:${window.location.port}` : '';
	return `${protocol}//${host}${port}`;
}

let webSocket;

function connectWebSocket() {
	const webSocketUrl = getWebSocketUrl();
	webSocket = new WebSocket(webSocketUrl);

	webSocket.onopen = event => {
		const connectionStatusDiv = document.getElementById('connectionStatus');
		connectionStatusDiv.className = 'btn btn-success';
		connectionStatusDiv.textContent = 'Connected';
		connectionStatusDiv.onclick = null; // Remove the click handler
	};

	webSocket.onclose = event => {
		const connectionStatusDiv = document.getElementById('connectionStatus');
		connectionStatusDiv.className = 'btn btn-danger';
		connectionStatusDiv.textContent = 'Reconnect';
		connectionStatusDiv.onclick = connectWebSocket; // Add click handler to reconnect
	};

	webSocket.onerror = err => {
		console.error('WebSocket error:', err);
	};

	webSocket.onmessage = event => {
		console.log(event);
	};
}

connectWebSocket();

