let currentPath = localStorage.getItem('user');
const selected = {};
let filesHash = {};

function createPopUp(type, options) {
	const isFileGiven = (options.file !== undefined);
	const divFillScreenBackground = document.createElement("div");
	divFillScreenBackground.className = "fill-screen center-y center-x black-transparent";
	const divContainer = document.createElement("div");
	divFillScreenBackground.onclick = function (event) { this.remove(); };
	divContainer.className = "popupContainer p-2";
	divContainer.onclick = (event) => { event.stopPropagation(); };
	const header = document.createElement("div");
	const headerText = isFileGiven ? options.title + " - " + options.file : options.title;
	header.innerHTML = `<b>${headerText}</b>`;
	header.className = "p-1";
	const body = document.createElement("div");
	body.className = "p-1";
	const footer = document.createElement("div");
	footer.className = "right-x p-1";

	function makeOkBtn(text = "Ok") {
		const okBtn = document.createElement("button");
		okBtn.className = "btn btn-primary margin-sides";
		okBtn.textContent = text;
		okBtn.onclick = () => divFillScreenBackground.remove();
		footer.appendChild(okBtn);
		return okBtn;
	}

	function makeCancelBtn(text = "Cancel") {
		const cancelBtn = document.createElement("button");
		cancelBtn.className = "btn btn-secondary";
		cancelBtn.textContent = "Cancel";
		cancelBtn.onclick = () => divFillScreenBackground.remove();
		footer.appendChild(cancelBtn);
		return cancelBtn;
	}

	if (type === "input") {
		const okBtn = makeOkBtn(options.title);
		makeCancelBtn();
		const input = document.createElement("input");
		input.placeholder = options.message;
		input.style = "width: 100%;";
		body.appendChild(input);
		okBtn.onclick = (event) => {
			const filename = input.value;
			if (filename === undefined || filename === '' || filesHash[filename] !== undefined) {
				const div = document.createElement('div');
				div.textContent = "Name already exists, or no name entered";
				header.appendChild(div);
			} else {
				divFillScreenBackground.remove();
				options.callback(filename);
			}
		};
	}
	if (type === "options") {
		body.textContent = options.message;
		const btnOneText = options.optionOne ? options.optionOne : options.title;
		const btnTwoText = options.optionTwo ? options.optionTwo : "Cancel";
		const okBtn = makeOkBtn(btnOneText);
		makeCancelBtn(btnTwoText);
		okBtn.onclick = (event) => {
			divFillScreenBackground.remove();
			options.callback();
		};
	}
	if (type === "message") {
		body.textContent = options.message;
		const okBtn = makeOkBtn();
		if (options.callback) {
			okBtn.onclick = (event) => {
				divFillScreenBackground.remove();
				options.callback();
			};
		}
	}

	divContainer.appendChild(header);
	divContainer.appendChild(body);
	divContainer.appendChild(footer);
	divFillScreenBackground.appendChild(divContainer);
	document.body.appendChild(divFillScreenBackground);
}

function search(event) {
	const input = event.srcElement[0].value;
	if (input === undefined || input === '') return false;
	const regex = ((input) => {
		try {
			const pattern = input.replace(/(^\/)|(\/[a-z]*$)/g, '');
			const flags = input.match(/[^/]+$/)[0];
			const regex = new RegExp(pattern, flags);
			return regex;
		} catch (err) {
			return new RegExp(input);
		}
	})(input);
	const filteredFiles = Object.values(filesHash).filter((fileStats) => { return regex.test(fileStats.filename); });
	// Function sets dropdowns display to none adds button as first child. That buttons has onclick callback that sets display to flex again && addFilesToTable(Object.values(filesHash)) && removes itself

	if (document.querySelector('#subfolder-search').checked) {
		// ajax call for all files that match regex
		console.log('Backend subfolder search')
	} else {
		addFilesToTable(filteredFiles);
	}
}

function createTextFile(event) {
	const title = 'Create file';
	const message = 'Type filename';
	const cb = (filename) => {
		ajaxPost('/createfile', { path: currentPath, filename: filename }, (filename) => {
			console.log("Created file: " + filename);
			createPopUp("message", { title: "Created file", message: `New file: ${filename}`, callback: () => { 
				ajaxPost('/getfiles', { path: currentPath }, (data) => { addFilesToTable(data); });
			} });
		});
	}
	createPopUp("input", { title: title, message: message, callback: cb });
}

function createFolder(event) {
	const title = 'Create folder';
	const message = 'Type folder name';
	const cb = (filename) => {
		ajaxPost('/createfolder', { path: currentPath, filename: filename }, (filename) => {
			console.log("Created folder: " + filename);
			createPopUp("message", { title: "Created folder", message: `New folder: ${filename}`, callback: () => { 
				ajaxPost('/getfiles', { path: currentPath }, (data) => { addFilesToTable(data); });
			} });
		});
	}
	createPopUp("input", { title: title, message: message, callback: cb });
}

function downloadURLInput(event) {
	const title = 'Download from URL';
	const message = 'Enter URL to download file or folder to current directory';
	const cb = (url) => {
		// Need to add /downloadURL to backend and handle the url and filename that is used for downloaded file
		console.log('Will make ajax for downloading file / folder');
		return true;
		ajaxPost('/downloadURL', { path: currentPath, url: url }, (filename) => {
			console.log("Downloaded: " + filename);
			createPopUp("message", { title: "Downloaded from URL", message: `New file: ${filename}`, callback: () => { 
				ajaxPost('/getfiles', { path: currentPath }, (data) => { addFilesToTable(data); });
			} });
		});
	}
	createPopUp("input", { title: title, message: message, callback: cb });
}

function downloadFile(file) {
	const path = currentPath + "/" + file;
	const a = document.createElement('a');
	a.href = `/download?type=file&path=${encodeURIComponent(path)}`;
	a.click();
}

function downloadFolder(file) {
	const path = currentPath + "/" + file;
	const a = document.createElement('a');
	a.href = `/download?type=zip&path=${encodeURIComponent(path)}`;
	a.click();
}

function download(event) {
	const numSelected = Object.keys(selected).length;
	const includesFolder = Object.values(selected).includes("Folder");
	const title = "Download";
	if (numSelected === 1 && !includesFolder) {
		const filename = Object.keys(selected)[0];
		const message = `Would you like to download this file?`;
		const cb = () => {
			downloadFile(filename);
			createPopUp("message", { title: "Downloading file", message: `Currently downloading: ${filename}` });
		};
		createPopUp("options", { title: title, message: message, file: filename, callback: cb });
	} else if (numSelected === 1 && includesFolder) {
		const filename = Object.keys(selected)[0];
		const message = `Would you like to download this folder?`;
		const cb = () => {
			// downloadFolder(foldername);
			createPopUp("message", { title: "Downloading folder", message: `Currently downloading: ${filename}` });
		};
		createPopUp("options", { title: title, message: message, file: filename, callback: cb });
	} else if (numSelected > 1 && includesFolder) {
		const cb = () => {
			console.log("Download " + numSelected + ". True for Folders or Folder && files(s)");
			createPopUp("message", { title: "Downloading folders / folder and file(s)", message: `Download ${numSelected}. Folders or Folder && files(s)` });
		};
		cb();
	} else if (numSelected > 1 && !includesFolder) {
		const cb = () => {
			console.log("Download " + numSelected + " Files. No Folders.");
			createPopUp("message", { title: "Downloading files", message: `Download ${numSelected} files. No Folders.` });
		};
		cb();
	} else {
		const cb = () => {
			console.log("Nothing selected");
			createPopUp("message", { title: "Attempted to Download", message: "Nothing selected" });
		};
		cb();
	}
}

function rename(event) {
	const numSelected = Object.keys(selected).length;
	const title = "Rename";
	if (numSelected === 1) {
		const filename = Object.keys(selected)[0];
		const message = "Type new name";
		const cb = (newFilename) => {
			// ajax call to rename ${filename} to ${newFilename}
			console.log(`Renamed "${filename}" to "${newFilename}"`);
			createPopUp("message", { title: "Renamed file or folder", message: `Renamed "${filename}" to "${newFilename}"` });
		};
		createPopUp("input", { title: title, message: message, file: filename, callback: cb });
	} else {
		const message = (numSelected === 0 ) ? "Nothing is selected silly. Select one to rename." : "You can only select one. You tried to rename " + numSelected + ".";
		createPopUp("message", { title: title, message: message });
	}
}

function createLink(event) {
	const numSelected = Object.keys(selected).length;
	const title = "Create Shareable Link";
	if (numSelected === 1) {
		const message = "Type link name";
		const cb = (linkName) => {
			//ajax call to create shared files link
			console.log(`Created link: "${linkName}"`);
			createPopUp("message", { title: "Created Sharable Link", message: `Created link: ${linkName}` });
		};
		createPopUp("input", { title: title, message: message, callback: cb });
	} else {
		const message = "Nothing is selected silly. Select files to share.";
		createPopUp("message", { title: title, message: message });
	}
}

function addToSelected(el) {
	let key = el.getAttribute("filename");
	let value = el.getAttribute("fileType");
	selected[key] === undefined ? selected[key] = value : (delete selected[key]);
}

function addAllSelected(el) {
	Array.from(document.querySelectorAll('.checkbox')).forEach(checkboxEl => {
		if (checkboxEl.checked != el.checked) {
			checkboxEl.checked = el.checked;
			addToSelected(checkboxEl);
		}
	});
}

function updateDirectoryButtons(path) {
	const container = document.querySelector("body > div > div.files > div > div.flex-r > div:last-child");
	const newContainer = $(container.outerHTML);
	newContainer.empty();

	let steppingPath = '';
	const buttonList = path.split('/');
	buttonList.forEach(elText => {
		const button = document.createElement('button');
		button.textContent = elText;
		button.className = "btn";
		steppingPath += elText + '/';
		let jumpToPath = steppingPath;
		button.onclick = function (event) {
			openDirectory(jumpToPath);
		}
		const div = document.createElement('div');
		div.textContent = '/';
		div.className = 'center-y';
		newContainer.get(0).appendChild(div);
		newContainer.get(0).appendChild(button);
	});

	const fileOptions = document.querySelector("body > div > div.files > div > div.flex-r");
	fileOptions.removeChild(container);
	fileOptions.appendChild(newContainer.get(0));
}

function updateInputPathText(path) {
	const input = document.querySelector("body > div > div.files > div > div.flex-0-1 > input");
	input.value = path;
}

function openDirectory(path) {
	Array.from(document.querySelector("body > div > div.files > table > thead > tr").children).forEach(el => { // Remove selected class from each sort option
		el.classList.remove('selected');
	});

	path = path.replace(/\/$/, '');
	currentPath = path;
	updateInputPathText(path);
	updateDirectoryButtons(path);
	ajaxPost('/getfiles', { path: path }, (data) => { addFilesToTable(data); });
}

function openFile(path) {
	const filename = path.split('/').pop();
	console.log('Tried to open ' + filename);
}

function utcToCurrentTime(utcTimeString) {
	const utcDate = new Date(utcTimeString);
	const localDate = new Date(utcDate.localTime());
	const formattedLocalTime = localDate.toTimestamp();
	return formattedLocalTime;
}

function sortArrOfObj(arr, key, direction = 1) {
	arr.sort((a, b) => {
		const valA = a[key];
		const valB = b[key];
		if (valA === valB) return 0; // Short circuit if they're equal
		let firstBool;
		let secondBool;
		if (key === "fileExtension") { // Sort folders & empty extensions above everything else
			firstBool = (valA === '' && valB !== '');
			secondBool = (valA !== '' && valB === '');
		} else {
			firstBool = (valA < valB);
			secondBool = (valA > valB);
		}
		if (firstBool) return -1 * direction;
		if (secondBool) return 1 * direction;
		return 0;
	});
}

function addFilesToTable(fileList, sortKey = "filename", sortDirection = 1, lastSortKey="filename") {
	const numFiles = fileList.length;
	document.querySelector("#file-count").textContent = "File Count: " + numFiles;

	document.querySelector("#" + lastSortKey).classList.remove('selected');
	document.querySelector("#" + sortKey).classList.add('selected');

	sortArrOfObj(fileList, sortKey, sortDirection);
	if (sortKey === "filename") {
		sortArrOfObj(fileList, "fileExtension", sortDirection);
	}

	const sortOptions = document.querySelector("body > div > div.files > div > div.flex-r ul").children;
	Array.from(sortOptions).forEach(el => {
		const value = el.dataset.value;
		el.onclick = e => {
			const column = value;
			let direction = sortDirection;
			if (column === sortKey || direction === -1) { // Change direction if same option. Force back to 1 if changing direction column
				direction = direction * -1;
			}
			addFilesToTable(fileList, column, direction, sortKey);
		};

		document.querySelector("#" + value).onclick = el.onclick; // Sets column onclick to sort option onclick
	});

	const tableBody = document.querySelector("body > div > div.files > table > tbody.table-group-divider");
	const newTableBody = document.createElement("tbody");
	newTableBody.className = "table-group-divider";

	fileList.forEach(fileStats => {
		const fileType = fileStats.isDirectory ? "Folder" : fileStats.fileExtension;
		const modifiedDate = utcToCurrentTime(fileStats.modifiedDate);
		const creationDate = utcToCurrentTime(fileStats.creationDate);
		const tableRow = document.createElement('tr');
		const els = [
			{ el: 'input', type: 'checkbox', className: 'checkbox', onclick: (event) => { addToSelected(event.target) }, attrs: { filename: fileStats.filename, fileType: fileType } },
			{ el: 'img', src: 'images/file-browser-icon.png', style: 'width:2.5rem' },
			{ text: fileStats.filename },
			{ text: modifiedDate },
			{ text: creationDate },
			{ text:  fileStats.sizeInBytes },
			{ text: fileType },
		];

		function setElOnclick(el, func) {
			el.onclick = function (event) {
				func(currentPath + '/' + fileStats.filename);
			}
		}

		els.forEach(obj => {
			const tableData = document.createElement('td');
			if (Object.keys(obj).length == 1 && obj.text) {
				tableData.textContent = obj.text;
				if (obj.text === fileStats.filename) {
					if (fileStats.isDirectory) {
						setElOnclick(tableData, openDirectory);
					} else {
						setElOnclick(tableData, openFile);
					}
				}
			} else {
				const el = document.createElement(obj.el);
				if (obj.type) el.type = obj.type;
				if (obj.src) el.src = obj.src;
				if (obj.className) el.className = obj.className;
				if (obj.style) el.style = obj.style;
				if (obj.onclick) el.onclick = obj.onclick;
				if (obj.attrs) {
					Object.keys(obj.attrs).forEach(attr => {
						el.setAttribute(attr, obj.attrs[attr]);
					});
					if (obj.type == 'checkbox' && selected[fileStats.filename] !== undefined) {
						el.checked = true;
					}
				}
				tableData.appendChild(el);
			}
			tableRow.appendChild(tableData);
		});
		newTableBody.appendChild(tableRow);
		filesHash[fileStats.filename] = fileStats;
	});

	const table = document.querySelector("body > div > div.files > table");
	table.removeChild(tableBody);
	table.appendChild(newTableBody);
}

function ajaxPost(route, data, callback, onerror) {
	$.ajax({
		url: route,
		method: 'POST',
		dataType: 'json',
		data: data,
		success: (rsp) => {
			if (rsp.error || !rsp.success) return onerror ? onerror(rsp.error) : console.error(rsp.error);
			callback(rsp.data);
		},
		error: function(err) {
			console.error(err);
		}
	});
}

$(document).ready(function() {
	ajaxPost('/getfiles', { path: currentPath }, (data) => { addFilesToTable(data); });
});
