// Function to update the div based on WebSocket status
function updateConnectionStatus(isConnected) {
	const statusDiv = document.getElementById('connectionStatus');
	if (isConnected) {
		statusDiv.classList.remove('btn-danger');
		statusDiv.classList.add('btn-success');
		statusDiv.textContent = 'Connected';
	} else {
		statusDiv.classList.remove('btn-success');
		statusDiv.classList.add('btn-danger');
		statusDiv.textContent = 'Disconnected';
	}
}

// Initialize WebSocket
function getWebSocketUrl() {
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	const host = window.location.hostname;
	const port = window.location.port ? `:${window.location.port}` : '';
	return `${protocol}//${host}${port}`;
}

const webSocketUrl = getWebSocketUrl();
const webSocket = new WebSocket(webSocketUrl);

// WebSocket event handlers
webSocket.onopen = function(event) {
	updateConnectionStatus(true);
};

webSocket.onclose = function(event) {
	updateConnectionStatus(false);
};

webSocket.onerror = function(error) {
	updateConnectionStatus(false);
	console.error('WebSocket Error:', error);
};

// Optional: Handle messages from the server
webSocket.onmessage = function(event) {
	console.log('WebSocket message received:', event.data);
};

