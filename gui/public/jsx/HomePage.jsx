import React from 'react';
import ScriptLoader from './ScriptLoader';
import '../css/base.css';
import '../css/home.css';

function HomePage(props) {
	const toggleMenuDisplay = () => {
		const style = document.querySelector("div.menu").style;
		style.display = style.display === "" ? "none" : "";
	};

	const handleInputChange = (event) => {
		window.search && window.search(event);
	};

	return (
		<div id="body">
			<ScriptLoader src="../js/jquery-3.7.1.js" />
			<ScriptLoader src="../js/jslib-dom.js" />
			<ScriptLoader src="../js/utils.js" />
			<ScriptLoader src="../js/websocket.js" />
			<ScriptLoader src="../js/components.js" />
			<ScriptLoader src="../js/selection.js" />
			<ScriptLoader src="../js/file-actions.js" />
			<ScriptLoader src="../js/base.js" />
			<ScriptLoader src="../js/logout.js" />

			<header>
				<nav className="navbar bg-body-tertiary">
					<button className="btn btn-primary navbar-brand" onClick={toggleMenuDisplay}>
						<div className="center-y">
							<svg width="30" height="30" className="bi bi-list" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
								<path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
							</svg>
						</div>
					</button>
					<div className="flex-fill"></div>
					<div className="flex-r">
						<input
							className="form-control me-2"
							type="text"
							placeholder="Search"
							onChange={handleInputChange}
						/>
						<button className="btn btn-primary" style={{ padding: '0 0.2rem' }}>
							<div className="center-y">
								<svg width="20" height="20" className="bi bi-search" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
									<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
								</svg>
							</div>
						</button>
					</div>
					<div className="flex-c center-y" style={{ margin: '0 0 0 0.4rem' }} title="Subfolder search (backend)">
						<div style={{ margin: '0 0 0.2rem 0' }}>
							<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512" style={{ fill: '#0d6efd' }}>
								<path d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32v96V384c0 35.3 28.7 64 64 64H256V384H64V160H256V96H64V32zM288 192c0 17.7 14.3 32 32 32H544c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32H445.3c-8.5 0-16.6-3.4-22.6-9.4L409.4 9.4c-6-6-14.1-9.4-22.6-9.4H320c-17.7 0-32 14.3-32 32V192zm0 288c0 17.7 14.3 32 32 32H544c17.7 0 32-14.3 32-32V352c0-17.7-14.3-32-32-32H445.3c-8.5 0-16.6-3.4-22.6-9.4l-13.3-13.3c-6-6-14.1-9.4-22.6-9.4H320c-17.7 0-32 14.3-32 32V480z"/>
							</svg>
						</div>
						<input type="checkbox" id="subfolder-search" />
					</div>
					<a className="navbar-brand" href="">
						<img src="images/file-browser-icon.png" alt="File Browser Icon" />
					</a>
				</nav>
			</header>
			<div id="content">
				<div className="menu">
					<div>
						<div id="connectionStatus" className="btn btn-danger" onClick={() => window.connectWebSocket && window.connectWebSocket()}>
							Reconnect
						</div>
					</div>
					<div className="dropdown">
						<button className="btn nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">Add New</button>
						<ul className="dropdown-menu">
							<li className="dropdown-item" onClick={(event) => window.createFolder && window.createFolder(event)}>New folder</li>
							<li className="dropdown-item" onClick={(event) => window.createTextFile && window.createTextFile(event)}>New text file</li>
							<hr className="dropdown-divider" />
							<li className="dropdown-item" onClick={(event) => window.upload && window.upload(event)}>Upload</li>
							<hr className="dropdown-divider" />
							<li className="dropdown-item" onClick={(event) => window.downloadURL && window.downloadURL(event)}>URL to download</li>
						</ul>
					</div>
					<div>
						<a href="/home">
							<button className="btn">Home</button>
						</a>
					</div>
					<div>
						<button className="btn" onClick={(event) => window.openShared && window.openShared(event)}>Shared</button>
					</div>
					<div>
						<button className="btn" onClick={(event) => window.openTrash && window.openTrash(event)}>Trash</button>
					</div>
					<div>
						<a href="/about">
							<button className="btn">About page</button>
						</a>
					</div>
					<div>
						<button className="btn" onClick={(event) => window.logout && window.logout(event, props.setIsLoggedIn)}>Log out</button>
					</div>
					<div id="file-count" className="btn">File count: 3</div>
					<div className="btn" onClick={(event) => window.getJoke && window.getJoke(event)}>Need a joke?</div>
				</div>
				<div className="files">
					<div className="flex-c">
						<div className="flex-r" style={{ margin: '0 0 0.3rem 0' }}>
							<div id="dropdowns" className="flex-r">
								<div className="dropdown">
									<button className="btn nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
										Sort by
									</button>
									<ul className="dropdown-menu">
										<li className="dropdown-item" data-value="filename">Name</li>
										<li className="dropdown-item" data-value="modifiedDate">Modified Date</li>
										<li className="dropdown-item" data-value="creationDate">Creation Date</li>
										<li className="dropdown-item" data-value="sizeInBytes">Size</li>
										<li className="dropdown-item" data-value="fileExtension">Type</li>
									</ul>
								</div>
								<div className="dropdown">
									<button className="btn nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
										Options
									</button>
									<ul className="dropdown-menu">
										<li className="dropdown-item" onClick={(event) => window.download && window.download(event)}>Download</li>
										<li className="dropdown-item" onClick={(event) => window.rename && window.rename(event)}>Rename</li>
										<li className="dropdown-item" onClick={(event) => window.createLink && window.createLink(event)}>Create link</li>
										<hr className="dropdown-divider" />
										<li className="dropdown-item" onClick={(event) => window.move && window.move(event)}>Move</li>
										<li className="dropdown-item" onClick={(event) => window.copy && window.copy(event)}>Copy</li>
										<li className="dropdown-item" onClick={(event) => window.symbolicLink && window.symbolicLink(event)}>Symbolic link</li>
										<hr className="dropdown-divider" />
										<li className="dropdown-item" onClick={(event) => window.trash && window.trash(event)}>Trash</li>
										<li className="dropdown-item" onClick={(event) => window.del && window.del(event)}>Delete</li>
										<hr className="dropdown-divider" />
										<li className="dropdown-item">Details</li>
									</ul>
								</div>
							</div>
							<div id="filePathButtons" className="flex-r flex-0-1 overflow-x-auto"></div>
						</div>
						<div className="flex-0-1">
							<input className="form-control" type="text" name="path" placeholder="Type in a valid path" defaultValue="" />
						</div>
					</div>
					<table className="table table-hover">
						<thead>
							<tr>
								<td><input id="select-all" type="checkbox" onClick={(event) => window.selectAll && window.selectAll(event.target)} /></td>
								<th>Icon</th>
								<th id="filename">Name</th>
								<th id="modifiedDate">Modified Date</th>
								<th id="creationDate">Created Date</th>
								<th id="sizeInBytes">Size (bytes)</th>
								<th id="fileExtension">Type</th>
							</tr>
						</thead>
						<tbody className="table-group-divider">
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

export default HomePage;

