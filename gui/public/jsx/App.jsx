import React from 'react';
import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage';
//import HomePage from './HomePage';
import AboutPage from './AboutPage';

function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

function PathLogger() {
    const location = useLocation();
    console.log("Current path:", location.pathname);
    return null; // This component doesn't render anything
}

	return (
		<BrowserRouter basename="/">
			<Routes>
				<Route path="/login" element={<LoginPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>} />
				<Route path="/about" element={<AboutPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>} />
			</Routes>
		</BrowserRouter>
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
