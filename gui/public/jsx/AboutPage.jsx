import React from 'react';
import '../css/base.css';
import '../js/websocket.js';
import '../js/logout.js';


function AboutPage(props) {
	return (
		<div>
			<header>
				<nav class="navbar bg-body-tertiary">
					<button class="btn btn-primary navbar-brand" onclick='s=document.querySelector("body > div > div.menu").style;s.display===""?s.display="none":s.display="";'>
						<div class="center-y">
							<svg width="30" height="30" class="bi bi-list" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
							<path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
							</svg>
						</div>
					</button>
					<a class="navbar-brand" href="">About page</a>
					<div class="flex-fill"></div>
					<a class="navbar-brand" href="">
						<img src="images/file-browser-icon.png" />
					</a>
				</nav>
			</header>
			<div>
				<div class="menu">
					<div>
						<div id="connectionStatus" class="btn btn-danger" onclick="connectWebSocket()">Reconnect</div>
					</div>
						<div class="dropdown">
							<button class="btn nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">Add New</button>
							<ul class="dropdown-menu">
								<li><a class="dropdown-item" href="#">Action</a></li>
								<li><a class="dropdown-item" href="#">Another action</a></li>
								<li><hr class="dropdown-divider"></li>
								<li><a class="dropdown-item" href="#">Something else here</a></li>
							</ul>
						</div>
					<div>
						<a href="/home">
							<button class="btn">Home</button>
						</a>
					</div>
					<div>
						<button class="btn">Shared</button>
					</div>
					<div>
						<button class="btn">Trash</button>
					</div>
					<div>
						<a href="/about">
							<button class="btn">About page</button>
						</a>
					</div>
					<div>
						<button class="btn" onclick="logout(event, {props.setIsLoggedIn})">Log out</button>
					</div>
				</div>
				<div>
					<h2 style="text-align: center; border-bottom: groove;">My story, and my why</h2>
					<p style="font-size: 1.2rem;">If you're like me, you have photos, videos and files you want to access and share privately. With some technical know how and a few dollars a month you could host your own server and have all your files stored safely on the cloud accessible through any browser. Cloud services are expensive and there's no way to gaurentee your infomation is private. Plus, they require other people to have an account to access any files you share. In general, storing files and sharing them is tough. I plan on making self hosted cloud storage and file sharing easy and simple, whether it be from a laptop or mobile device.</p>
				</div>
			</div>
		</div>
	);
}

export default AboutPage;

