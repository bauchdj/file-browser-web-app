import React from 'react';
import Header from './Header';
import '../css/base.css';
import '../css/home.css';
import '../js/jquery-3.7.1.js';
import '../js/jslib-dom.js';
import '../js/utils.js';
import '../js/websocket.js';
import '../js/components.js';
import '../js/selection.js';
import '../js/file-actions.js';
import '../js/base.js';
import '../js/logout.js';

function HomePage(props) {
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
					<div class="flex-fill"></div>
					<div class="flex-r">
						<input class="form-control me-2" type="text" placeholder="Search" onchange="search(event)">
						<button class="btn btn-primary" style="padding: 0 0.2rem 0 0.2rem">
							<div class="center-y">
								<svg width="20" height="20" class="bi bi-search" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
									<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"></path>
								</svg>
							</div>
						</button>
					</div>
					<div class="flex-c center-y" style="margin: 0 0 0 0.4rem;" title="Subfolder search (backend)">
						<div style="margin:0 0 0.2rem 0;">
							<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512" style="fill:#0d6efd;">
								<path d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32v96V384c0 35.3 28.7 64 64 64H256V384H64V160H256V96H64V32zM288 192c0 17.7 14.3 32 32 32H544c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32H445.3c-8.5 0-16.6-3.4-22.6-9.4L409.4 9.4c-6-6-14.1-9.4-22.6-9.4H320c-17.7 0-32 14.3-32 32V192zm0 288c0 17.7 14.3 32 32 32H544c17.7 0 32-14.3 32-32V352c0-17.7-14.3-32-32-32H445.3c-8.5 0-16.6-3.4-22.6-9.4l-13.3-13.3c-6-6-14.1-9.4-22.6-9.4H320c-17.7 0-32 14.3-32 32V480z">
								</path>
							</svg>
						</div>
						<input type="checkbox" id="subfolder-search">
					</div>
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
							<li class="dropdown-item" onclick="createFolder(event)">New folder</li>
							<li class="dropdown-item" onclick="createTextFile(event)">New text file</li>
							<li><hr class="dropdown-divider"></li>
							<li class="dropdown-item" onclick="upload(event)">Upload</li>
							<li><hr class="dropdown-divider"></li>
							<li class="dropdown-item" onclick="downloadURL(event)">URL to download</li>
						</ul>
					</div>
					<div>
						<a href="/home">
							<button class="btn">Home</button>
						</a>
					</div>
					<div>
						<button class="btn" onclick="opeShared(event)">Shared</button>
					</div>
					<div>
						<button class="btn" onclick="openTrash(event)">Trash</button>
					</div>
					<div>
						<a href="/about">
							<button class="btn">About page</button>
						</a>
					</div>
					<div>
						<button class="btn" onclick="logout(event, {props.setIsLoggedIn})">Log out</button>
					</div>
					<div id="file-count" class="btn">File count: 3</div>
					<div class="btn" onclick="getJoke(event)">Need a joke?</div>
				</div>
				<div class="files">
					<div class="flex-c">
						<div class="flex-r" style="margin: 0 0 0.3rem 0;">
							<div id="dropdowns" class="flex-r">
								<div class="dropdown">
									<button class="btn nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
										Sort by
									</button>
									<ul class="dropdown-menu">
										<li class="dropdown-item" data-value="filename">Name</li>
										<li class="dropdown-item" data-value="modifiedDate">Modified Date</li>
										<li class="dropdown-item" data-value="creationDate">Creation Date</li>
										<li class="dropdown-item" data-value="sizeInBytes">Size</li>
										<li class="dropdown-item" data-value="fileExtension">Type</li>
									</ul>
								</div>
								<div class="dropdown">
									<button class="btn nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
										Options
									</button>
									<ul class="dropdown-menu">
										<li class="dropdown-item" onclick="download(event)">Download</li>
										<li class="dropdown-item" onclick="rename(event)">Rename</li>
										<li class="dropdown-item" onclick="createLink(event)">Create link</li>
										<li><hr class="dropdown-divider"></li>
										<li class="dropdown-item" onclick="move(event)">Move</li>
										<li class="dropdown-item" onclick="copy(event)">Copy</li>
										<li class="dropdown-item" onclick="symbolicLink(event)">Symbolic link</li>
										<li><hr class="dropdown-divider"></li>
										<li class="dropdown-item" onclick="trash(event)">Trash</li>
										<li class="dropdown-item" onclick="del(event)">Delete</li>
										<li><hr class="dropdown-divider"></li>
										<li class="dropdown-item">Details</li>
									</ul>
								</div>
							</div>
							<div id="filePathButtons" class="flex-r flex-0-1 overflow-x-auto"></div>
						</div>
						<div class="flex-0-1">
							<input class="form-control" type="text" name="path" placeholder="Type in a valid path" value="">
						</div>
					</div>
					<table class="table table-hover">
						<thead>
							<tr>
								<td><input id="select-all" type="checkbox" onclick="selectAll(this)"></td>
								<th>Icon</th>
								<th id="filename">Name</th>
								<th id="modifiedDate">Modified Date</th>
								<th id="creationDate">Created Date</th>
								<th id="sizeInBytes">Size (bytes)</th>
								<th id="fileExtension">Type</th>
							</tr>
						</thead>
						<tbody class="table-group-divider">
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

export default HomePage;

