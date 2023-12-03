import React from 'react';
import '../js/login.js';
import '../css/login.css'

function LoginPage(props) {
	return (
		<div>
			<header>
				<nav class="navbar bg-body-tertiary">
					<a class="navbar-brand" href="">Login page</a>
					<div class="flex-fill"></div>
					<a class="navbar-brand" href="">
						<img src="images/file-browser-icon.png" />
					</a>
				</nav>
			</header>
			<div>
				<form action="login" method="post" onsubmit="handleFormSubmit(event, {props.setIsLoggedIn})">
					<legend>Login</legend>
					<div class="mb-2">
						<input type="text" class="form-control" name="username" placeholder="Username" required autocomplete="username" minlength="2" maxlength="30">
					</div>
					<div class="mb-2">
						<input type="password" class="form-control" name="password" placeholder="Password" required autocomplete="current-password" pattern="^(?=.*[a-zA-Z])(?=.*\d).+$" minlength="5" maxlength="30">
						<div class="form-text">Must contain at least <b>one letter</b> and <b>one number</b></div>
						<div class="form-text">Guest login is <b>guest</b> and <b>2bemyguestlogin</b></div>
					</div>
					<div class="flex-r">
						<button type="submit" class="btn btn-primary">Login</button>
						<input style="margin: 0.3rem;" type="checkbox" id="createUserCheckbox">
						<div class="center-y">Create new user</div>
					</div>
				</form>
			</div>
		</div>
	);
}

export default LoginPage;

