import React from 'react';
import { useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import AboutPage from './AboutPage';
import Footer from '.Footer';

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	return (
		<BrowserRouter>
			<Switch>
				<Route path="/login">
					<LoginPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
				</Route>
				<Route path="/home">
					<HomePage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
				</Route>
				<Route path="/about">
					<AboutPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
				</Route>
				<Route path="/">
					<HomePage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
				</Route>
			</Switch>
			<Footer />
		</BrowserRouter>
	)
}

export default App
