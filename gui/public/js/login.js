function handleFormSubmit(event, setIsLoggedIn) {
	event.preventDefault(); // Prevent default form submission

	const form = event.target;
	const username = form.querySelector('input[name="username"]').value;
	const password = form.querySelector('input[name="password"]').value;
	const isCreateUser = form.querySelector('#createUserCheckbox').checked;

	if (isCreateUser) {
		createUser(username, password, setIsLoggedIn);
	} else {
		login(username, password, setIsLoggedIn);
	}
}

function postData(url, data, successCallback, errorCallback) {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');

	xhr.onreadystatechange = () => {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			const data = JSON.parse(xhr.responseText);
			if (xhr.status >= 200 && xhr.status < 300) {
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

function onLogin(username, setIsLoggedIn) {
	localStorage.removeItem('user');
	localStorage.setItem('user', username)
	setIsLoggedIn(true);
	window.location.href = "/home";
}

function createUser(username, password, setIsLoggedIn) {
	postData('/create/user', { username, password }, data => {
		console.log('User created:', data);
		onLogin(username, setIsLoggedIn);
	}, (err, message) => {
		if (err) console.error('Error:', err);
		alert(message);
	});
}

function login(username, password, setIsLoggedIn) {
	postData('/login', { username, password }, res => {
		console.log('Login successful:', res);
		onLogin(username, setIsLoggedIn);
	}, (err, message) => {
		if (err) console.error('Error:', err);
		alert(message);
	});
}

