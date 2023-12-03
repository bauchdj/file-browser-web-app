import React from 'react';
import { useState } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
//import HomePage from './HomePage';
//import AboutPage from './AboutPage';

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	return (
		<div>
			<LoginPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
		</div>
	)

	/*
	return (
		<BrowserRouter>
			<Route path="/login">
				<LoginPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
			</Route>
			<Route path="/home">
				<HomePage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
			</Route>
			<Route path="/about">
				<AboutPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
			</Route>
			<Route exact path="/">
				<HomePage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
			</Route>
			<div>404</div>
			<Footer />
		</BrowserRouter>
	)
	*/
}

export default App
