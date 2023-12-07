import React, { useState, useEffect } from 'react';
import Footer from './Footer';
import '../css/base.css';
import ScriptLoader from './ScriptLoader';


function AboutPage(props) {
	const [isWebsocketLoaded, setWebsocketLoaded] = useState(false);
	const [isLogoutLoaded, setLogoutLoaded] = useState(false);

	const toggleMenuDisplay = () => {
		const style = document.querySelector("div.menu").style;
		style.display = style.display === "" ? "none" : "";
	};

	const connectWS = () => {
		connectWebSocket();
	};

	return (
		<div id="body">
			<ScriptLoader src="../js/websocket.js" onLoad={() => setWebsocketLoaded(true)} />
			<ScriptLoader src="../js/logout.js" onLoad={() => setLogoutLoaded(true)} />
			<header>
				<nav className="navbar bg-body-tertiary">
					<button className="btn btn-primary navbar-brand" onClick={toggleMenuDisplay}>
						<div className="center-y">
							<svg width="30" height="30" className="bi bi-list" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
								<path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
							</svg>
						</div>
					</button>
					<a className="navbar-brand" href="">About page</a>
					<div className="flex-fill"></div>
					<a className="navbar-brand" href="">
						<img src="images/file-browser-icon.png" />
					</a>
				</nav>
			</header>
			<div id="content">
				<div className="menu">
					<div>
						<div id="connectionStatus" className="btn btn-danger" onClick={connectWS}>Reconnect</div>
					</div>
					<div className="dropdown">
						<button className="btn nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">Add New</button>
						<ul className="dropdown-menu">
							<li><a className="dropdown-item" href="#">Action</a></li>
							<li><a className="dropdown-item" href="#">Another action</a></li>
							<li><hr className="dropdown-divider" /></li>
							<li><a className="dropdown-item" href="#">Something else here</a></li>
						</ul>
					</div>
					<div>
						<a href="/home">
							<button className="btn">Home</button>
						</a>
					</div>
					<div>
						<button className="btn">Shared</button>
					</div>
					<div>
						<button className="btn">Trash</button>
					</div>
					<div>
						<a href="/about">
							<button className="btn">About page</button>
						</a>
					</div>
					<div>
						<button className="btn" onClick={event => logout(event, props.setIsLoggedIn)}>Log out</button>
					</div>
				</div>
				<div>
					<h2 style={{ textAlign: 'center', borderBottom: 'groove' }}>My story, and my why</h2>
					<p style={{ fontSize: '1.2rem' }}>If you're like me, you have photos, videos and files you want to access and share privately. With some technical know how and a few dollars a month you could host your own server and have all your files stored safely on the cloud accessible through any browser. Cloud services are expensive and there's no way to gaurentee your infomation is private. Plus, they require other people to have an account to access any files you share. In general, storing files and sharing them is tough. I plan on making self hosted cloud storage and file sharing easy and simple, whether it be from a laptop or mobile device.</p>
				</div>
			</div>
			<Footer />
		</div>
	);
}

export default AboutPage;

