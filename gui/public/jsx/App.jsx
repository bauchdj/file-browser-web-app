import React from 'react';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
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
				<Route path="/" element={isLoggedIn ? <Navigate replace to="/home" /> : <Navigate replace to="/login" />} />
				<Route path="/login" element={isLoggedIn ? <Navigate replace to="/home" /> : <LoginPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>} />
				<Route path="/home" element={<HomePage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>} />
				<Route path="/about" element={<AboutPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>} />
			</Routes>
		</BrowserRouter>
	);
}

export default App
