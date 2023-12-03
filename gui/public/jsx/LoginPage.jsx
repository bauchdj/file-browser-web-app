import React from 'react';
import '../js/login.js';
import '../css/login.css'

function LoginPage(props) {
	function onSubmit(event) {
		handleFormSubmit(event, props.setIsLoggedIn);
	}

	return (
		<div>
			<header>
				<nav className="navbar bg-body-tertiary">
					<a className="navbar-brand" href="">Login page</a>
					<div className="flex-fill"></div>
					<a className="navbar-brand" href="">
						<img src="images/file-browser-icon.png" />
					</a>
				</nav>
			</header>
			<div>
				<form action="login" method="post" onSubmit={onSubmit}>
					<legend>Login</legend>
					<div className="mb-2">
						<input type="text" className="form-control" name="username" placeholder="Username" required autoComplete="username" minLength="2" maxLength="30" />
					</div>
					<div className="mb-2">
						<input type="password" className="form-control" name="password" placeholder="Password" required autoComplete="current-password" pattern="^(?=.*[a-zA-Z])(?=.*\d).+$" minLength="5" maxLength="30" />
						<div className="form-text">Must contain at least <b>one letter</b> and <b>one number</b></div>
						<div className="form-text">Guest login is <b>guest</b> and <b>2bemyguestlogin</b></div>
					</div>
					<div className="flex-r">
						<button type="submit" className="btn btn-primary">Login</button>
						<input style={{ margin: '0.3rem' }} type="checkbox" id="createUserCheckbox" />
						<div className="center-y">Create new user</div>
					</div>
				</form>
			</div>
		</div>
	);
}

export default LoginPage;

