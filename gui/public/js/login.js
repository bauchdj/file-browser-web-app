function handleFormSubmit(event) {
	event.preventDefault(); // Prevent default form submission

	const form = event.target;
	const username = form.querySelector('input[name="username"]').value;
	const password = form.querySelector('input[name="password"]').value;
	const isCreateUser = form.querySelector('#create-user-checkbox').checked;

	if (isCreateUser) {
		createUser(username, password);
	} else {
		login(username, password);
	}
}

function postData(url, data, successCallback, errorCallback) {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');

	xhr.onreadystatechange = () => {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status >= 200 && xhr.status < 300) {
				const data = JSON.parse(xhr.responseText);
				successCallback(data);
			} else {
				errorCallback(xhr.statusText, data.message);
			}
		}
	};

	xhr.onerror = () => {
		errorCallback('Network error');
	};

	xhr.send(JSON.stringify(data));
}

function onLogin(username) {
	localStorage.removeItem('user');
	localStorage.setItem('user', username)
	window.location.href = "/home";
}

function createUser(username, password) {
	postData('/create/user', { username, password }, data => {
		console.log('User created:', data);
		onLogin(username);
	}, (err, message) => {
		if (err) console.error('Error:', err);
		alert(message);
	});
}

function login(username, password) {
	postData('/login', { username, password }, res => {
		console.log('Login successful:', res);
		onLogin(username);
	}, (err, message) => {
		if (err) console.error('Error:', err);
		alert(message);
	});
}

