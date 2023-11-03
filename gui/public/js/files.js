let currentPath = localStorage.getItem('user');
const selected = {};
let filesHash = {};

function createSelection(path) {
	const rc = {
		path: path,
		items: {},
	};

	rc.click = (el) => {
		const filename = el.getAttribute("filename");
		const fileType = el.getAttribute("fileType");
		if (!rc.items[filename]) {
			rc.items[filename] = { fileType: fileType, el: el };
		} else {
			delete rc.items[filename];
		}
	};

	rc.clear = () => {
		for (const key in rc.items) {
			rc.items[key].el.checked = false;
		}
		rc.items = {};
	};

	rc.filename = () => Object.keys(rc.items)[0];

	rc.length = () => Object.values(rc.items).length;

	rc.includesFolder = () => {
		for (const key in rc.items) {
			console.log(rc.items[key].fileType);
			if (rc.items[key].fileType === 'Folder') return true;
		}
		return false;
	};

	return rc;
}

function selectionClass() {
	const rc = { paths: {}, current: null };

	rc.add = (path) => {
		if (!rc.paths[path]) {
			rc.paths[path] = createSelection(path);
		}
		rc.current = rc.paths[path];
	};

	rc.clear = () => {
		for (const path in rc.paths) {
			rc.paths[path].clear();
		}
	};

	rc.length = () => {
		let length = 0;
		for (const path in rc.paths) {
			length += rc.paths[path].length();
		}
		return length;
	};

	rc.onlyFiles = () => {
		for (const path in rc.paths) {
			if (rc.paths[path].includesFolder()) return false;
		}
		return true;
	};

	rc.files = () => paths;

	return rc;
};

const selectionHash = selectionClass();
selectionHash.add(currentPath);

function selectAll(el) {
	const checkboxes = Array.from(document.querySelectorAll('.checkbox'));
	checkboxes.forEach(checkboxEl => {
		if (checkboxEl.checked != el.checked) {
			checkboxEl.checked = el.checked;
			selectionHash.current.click(checkboxEl);
		}
	});
}

function createPopUp(type, options) {
	const divFillScreenBackground = document.createElement("div");
	divFillScreenBackground.className = "fill-screen center-y center-x black-transparent";
	const divContainer = document.createElement("div");
	divFillScreenBackground.onclick = function (event) { this.remove(); };
	divContainer.className = "popupContainer p-2";
	divContainer.onclick = (event) => { event.stopPropagation(); };
	const header = document.createElement("div");
	const isFileGiven = (options.file !== undefined);
	const headerText = isFileGiven ? options.title + " - " + options.file : options.title;
	header.innerHTML = `<b>${headerText}</b>`;
	header.className = "p-1";
	const body = document.createElement("div");
	body.className = "p-1";
	const footer = document.createElement("div");
	footer.className = "right-x p-1";

	function makePrimaryBtn(text = "Ok", callback) {
		const primaryBtn = document.createElement("button");
		primaryBtn.className = "btn btn-primary margin-sides";
		primaryBtn.textContent = text;
		primaryBtn.onclick = (event) => { // default to removing pop up
			callback ? callback(event) : divFillScreenBackground.remove();
		};
		footer.appendChild(primaryBtn);
		return primaryBtn;
	}

	function makeSecondaryBtn(text = "Cancel") {
		const secondaryBtn = document.createElement("button");
		secondaryBtn.className = "btn btn-secondary";
		secondaryBtn.textContent = "Cancel";
		secondaryBtn.onclick = () => divFillScreenBackground.remove();
		footer.appendChild(secondaryBtn);
		return secondaryBtn;
	}

	if (type === "input") {
		const hiddenDiv = document.createElement("div");
		hiddenDiv.style = "height: 0; visibility: hidden;"
		hiddenDiv.ariaHidden = "true";
		hiddenDiv.textContent = options.message + "__";
		const input = document.createElement("input");
		input.placeholder = options.message;
		input.style = "width: 100%;";
		body.appendChild(hiddenDiv);
		body.appendChild(input);

		makeSecondaryBtn();
		makePrimaryBtn(options.title, (event) => {
			const value = input.value;
			const isValue = (value === undefined || value === '');
			const isFilename = options.inputType === "filename";
			const fileExist = (isFilename && filesHash[value] !== undefined);
			if (!isValue && !fileExist) {
				divFillScreenBackground.remove();
				options.callback(value);
				return;
			}
			const div = document.createElement('div');
			const text = fileExist ? "Name already exists" : "No name entered";
			div.textContent = text;
			header.appendChild(div);
		});
	}
	if (type === "options") {
		body.textContent = options.message;
		makeSecondaryBtn();
		options.btns.primary.forEach((item) => {
			makePrimaryBtn(item.text, (event) => {
				divFillScreenBackground.remove();
				item.callback(event);
				options.callback(event);
			});
		});
	}
	if (type === "message") {
		body.textContent = options.message;
		if (options.callback) {
			makePrimaryBtn("Ok", (event) => {
				divFillScreenBackground.remove();
				options.callback(event);
			});
		} else {
			makePrimaryBtn();
		}
	}

	divContainer.appendChild(header);
	divContainer.appendChild(body);
	divContainer.appendChild(footer);
	divFillScreenBackground.appendChild(divContainer);
	document.body.appendChild(divFillScreenBackground);
}

function createTextFile(event) {
	const title = "Create file";
	const message = 'Type filename';	
	createPopUp("input", { title: title, message: message, inputType: "filename", callback: (filename) => {
		ajaxPost('/createfile', { path: currentPath, filename: filename }, (filename) => {
			const message = `New file: "${filename}"`;
			console.log(message);
			createPopUp("message", { title: "Created file", message: message, callback: () => { 
				ajaxPost('/getfiles', { path: currentPath }, (data) => addFilesToTable(data));
			}});
		});
	}});
}

function createFolder(event) {
	const title = 'Create folder';
	const message = 'Type folder name';
	createPopUp("input", { title: title, message: message, inputType: "filename", callback: (filename) => {
		ajaxPost('/createfolder', { path: currentPath, filename: filename }, (filename) => {
			const message = `New folder: "${filename}"`;
			console.log(message);
			createPopUp("message", { title: "Created folder", message: message, callback: () => { 
				ajaxPost('/getfiles', { path: currentPath }, (data) => addFilesToTable(data));
			} });
		});
	}});
}

function downloadURL(event) {
	const title = 'Download from URL';
	const message = 'Enter URL to download file or folder to current directory';
	createPopUp("input", { title: title, message: message, inputType: "url", callback: (url) => {
		console.log('Will make ajax for downloading file / folder to server. Could be dangerous');
		// Need to add /downloadURL to backend and handle the url and filename that is used for downloaded file
		ajaxPost('/downloadURL', { path: currentPath, url: url }, (filename) => {
			const message = `Downloaded: "${filename}" from "${url}"`;
			console.log(message);
			createPopUp("message", { title: "Downloaded from URL", message: message, callback: () => { 
				ajaxPost('/getfiles', { path: currentPath }, (data) => addFilesToTable(data));
			} });
		});
	}});
}

function downloadFile(file) {
	const path = currentPath + "/" + file;
	const a = document.createElement('a');
	a.href = `/download?type=file&path=${encodeURIComponent(path)}`;
	a.click();
}

function downloadZip(filesList) {
	const path = currentPath + "/";
	console.log("Downloading zip:", filesList, "at path", path);
}

function download(event) {
	const numSelected = selectionHash.length();
	//const includesFolder = Object.values(selected).some((value) => Object.values(value).includes("Folder"));
	const includesFolder = !selectionHash.onlyFiles();
	const title = "Download";
	if (numSelected === 1 && !includesFolder) {
		const filename = selectionHash.current.filename();
		const message = `Would you like to download this file?`;
		const btns = {
			primary: [
				{ text: "Zip", callback: (event) => downloadZip([filename]) },
				{ text: "Raw file", callback: (event) => downloadFile(filename) },
			]
		}
		createPopUp("options", { title: title, message: message, btns: btns, file: filename, callback: (event) => {
			createPopUp("message", { title: "Downloading file", message: `Currently downloading: "${filename}"` });
		}});
	} else if (numSelected === 1 && includesFolder) {
		const filename = selectionHash.current.filename();
		const message = `Would you like to download this folder?`;
		const btns = {
			primary: [
				{ text: "Zip", callback: (event) => downloadZip([filename]) },
			]
		}
		createPopUp("options", { title: title, message: message, btns: btns, file: filename, callback: (event) => {
			createPopUp("message", { title: "Downloading folder", message: `Currently downloading zip of folder: "${filename}"` });
		}});
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
			console.log("Nothing is selected silly. Select something to download.");
			createPopUp("message", { title: "Attempted to Download", message: "Nothing selected" });
		};
		cb();
	}
}

function rename(event) {
	//const numSelected = Object.keys(selected).length;
	const numSelected = selectionHash.length();
	const title = "Rename";
	if (numSelected !== 1) {
		const message = (numSelected === 0 ) ? "Nothing is selected silly. Select one to rename." : "You can only select one. You tried to rename " + numSelected + ".";
		createPopUp("message", { title: title, message: message });
		return;
	}
	const filename = selectionHash.current.filename();
	const message = "Type new name";
	createPopUp("input", { title: title, message: message, file: filename, inputType: "filename", callback: (newFilename) => {
		console.log(`Renamed "${filename}" to "${newFilename}"`);
		/*
		ajaxPost('/rename', { path: path, filename: filename }, () => {
			const message = `Renamed: "${filename}" to "${newFilename}"`;
			console.log(message);
			createPopUp("message", { title: "Renamed", message: message, file: filename, callback: () => {
				ajaxPost('/getfiles', { path: currentPath }, (data) => addFilesToTable(data));
			}});
		});
		*/
	}});
}

function createLink(event) {
	//const numSelected = Object.keys(selected).length;
	const title = "Create Shareable Link";
	if (selectionHash.length() === 0) {
		createPopUp("message", { title: title, message: "Nothing is selected silly. Select files to share." });
		return;
	}
	const message = "Type link name";
	createPopUp("input", { title: title, message: message, inputType: "link", callback: (linkName) => {
		console.log(`Created link: "${linkName}"`);
		/*
		ajaxPost('/move', { files: filesMap, newPath: newPath }, () => {
			const message = `Created link: "${linkName}"`;
			console.log(message);
			createPopUp("message", { title: "Created Sharable Link", message: message, callback () => {
				ajaxPost('/getfiles', { path: currentPath }, (data) => addFilesToTable(data));
			}});
		});
		*/
	}});
}

function pathNavBtn(text, callback) {
	selectionHash.clear();
	const div = document.createElement("div");
	const btn = document.createElement("button");
	btn.className = "btn btn-primary";
	btn.textContent = text;
	const displayValue = window.getComputedStyle(document.querySelector("#dropdowns")).getPropertyValue('display');;
	btn.onclick = (event) => {
		document.querySelector("#dropdowns").style.display = displayValue;
		div.remove();
		callback(currentPath + "/");
	};
	div.appendChild(btn);
	document.querySelector("#dropdowns").style.display = "none";
	const parent = document.querySelector("body > div > div.files > div > div.flex-r");
	parent.insertBefore(div, parent.children[0]);
}

function search(event) {
	const el = event.srcElement[0];
	const input = el.value;
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
	const filteredFiles = Object.values(filesHash).filter((fileStats) => regex.test(fileStats.filename));
	pathNavBtn("Clear search results", (path) => {
		el.value = '';
		addFilesToTable(Object.values(filesHash))
	});

	if (document.querySelector("#subfolder-search").checked) {
		// ajax call for all files that match regex
		console.log("Backend subfolder search")
	} else {
		addFilesToTable(filteredFiles);
	}
}

function findDuplicates(array) {
	const uniqueValues = new Set();
	const duplicates = [];
	for (const item of array) {
		uniqueValues.has(item) ? duplicates.push(item) : uniqueValues.add(item);
	}
	return duplicates;
}

function isDuplicates(files, title) {
	const dupsFiles = findDuplicates(files);
	const dupsDir = findDuplicates(Object.keys(filesHash));
	const inFiles = dupsFiles.length !== 0;
	const inDir = dupsDir.length !== 0;
	if (!inFiles && !inDir) return false;
	let message = "Duplicates in:\n";
	if (inFiles) {
		message += `Selected files: "${dupsFiles.join(', ')}"\n`;
	}
	if (!inFiles && inDir) {
		message += `Directory: "${dupsDir.join(', ')}"`;
	}
	console.log(message);
	createPopUp("message", { title: `${title} failed - Duplicates`, message: message });
	return true;
}

function move(event) {
	//const numSelected = Object.keys(selected).length;
	const title = "Move";
	if (selectionHash.length() === 0) {	
		createPopUp("message", { title: title, message: "Nothing is selected silly. Select something to move." });
		return;
	}
	const filenames = selectionHash.files;
	const message = `Confirm move of "${filenames.join(', ')}"`;
	pathNavBtn(title, (newPath) => {
		// Check if any of the files names exist in newPath && if any of selected have same name (between different directories)
		if (isDuplicates(filenames, title)) return;
		createPopUp("message", { title: title, message: message, callback: () => {
			console.log(`Request backend to move ${filenames.join(', ')} to "${newPath}"`);
			/*
			ajaxPost('/move', { files: filesMap, newPath: newPath }, () => {
				const message = `Moved "${filenames.join(', ')}" to "${newPath}"`;
				console.log(message);
				createPopUp("message", { title: "Moved files", message: message, callback: () => { 
					ajaxPost('/getfiles', { path: currentPath }, (data) => addFilesToTable(data));
				}});
			});
			*/
		}});
	});
}

function copy(event) {
	//const numSelected = Object.keys(selected).length;
	const title = "Copy";
	if (selectionHash.length() === 0) {	
		createPopUp("message", { title: title, message: "Nothing is selected silly. Select something to copy." });
		return;
	}
	const filesMap = selected;
	const filenames = selectionHash.files;
	const message = `Confirm copy of "${filenames.join(', ')}"`;
	pathNavBtn(title, (newPath) => {
		if (isDuplicates(filenames, title)) return;
		createPopUp("message", { title: title, message: message, callback: () => {
			console.log(`Request backend to copy "${filenames.join(', ')}" to "${newPath}"`);
			/*
			ajaxPost('/copy', { files: filesMap, newPath: newPath }, () => {
				const message = `Copied "${filenames.join(', ')}" to "${newPath}"`;
				console.log(message);
				createPopUp("message", { title: "Copied files", message: message, callback: () => { 
					ajaxPost('/getfiles', { path: currentPath }, (data) => addFilesToTable(data));
				}});
			});
			*/
		}});
	});
}

function symbolicLink(event) {
	//const numSelected = Object.keys(selected).length;
	const numSelected = selectionHash.length();
	const title = "Symbolic Link";
	if (selectionHash.length() != 1) { // Make it work with multiple, like move and copy
		const message = (numSelected === 0 ) ? "Nothing is selected silly. Select one to symbolically link." : "You can only select one. You tried to link " + numSelected + ".";
		createPopUp("message", { title: title, message: message });
		return;
	}
	const path = currentPath + "/";
	const filename = selectionHash.current.filename();
	const message = "Type name of link";
	pathNavBtn(title, (newPath) => {
		createPopUp("input", { title: title, message: message, file: filename, inputType: "filename", callback: (linkName) => {
			console.log("Request to create symbolic link " + filename + " " + linkName, `Path: ${path}, newPath: ${newPath}`);
			/*
			ajaxPost('/symbolicLink', { path: path, newPath: newPath, filename: filename, linkName: linkName }, (linkName) => {
				const message = `Symbollically linked: "${filename}" to "${linkName}"`;
				console.log(message);
				createPopUp("message", { title: "Created symbolic link", message: message, callback: () => {
					ajaxPost('/getfiles', { path: currentPath }, (data) => addFilesToTable(data));
				}});
			});
			*/
		}});
	});
}

function updateDirectoryBtns(path) {
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
			changeDirectory(jumpToPath);
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

function changeDirectory(path) {
	path = path.replace(/\/$/, '');
	currentPath = path;
	selectionHash.add(currentPath);
	updateInputPathText(path);
	updateDirectoryBtns(path);
	ajaxPost('/getfiles', { path: path }, (data) => addFilesToTable(data));
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

function addFilesToTable(fileList, sortKey = "filename", sortDirection = 1, lastSortKey = "filename") {
	const row = document.querySelector("body > div > div.files > table > thead > tr");
	const columns = Array.from(row.children)
	columns.forEach(el => el.classList.remove('selected'));
	//document.querySelector("#" + lastSortKey).classList.remove('selected');
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

	const numFiles = fileList.length;
	document.querySelector("#file-count").textContent = "File count: " + numFiles;

	const tableBody = document.querySelector("body > div > div.files > table > tbody.table-group-divider");
	const newTableBody = document.createElement("tbody");
	newTableBody.className = "table-group-divider";

	fileList.forEach(fileStats => {
		const fileType = fileStats.isDirectory ? "Folder" : fileStats.fileExtension;
		const modifiedDate = utcToCurrentTime(fileStats.modifiedDate);
		const creationDate = utcToCurrentTime(fileStats.creationDate);
		const tableRow = document.createElement('tr');
		const els = [
			//{ el: 'input', type: 'checkbox', className: 'checkbox', onclick: (event) => addToSelected(event.target), attrs: { filename: fileStats.filename, fileType: fileType } },
			{ el: 'input', type: 'checkbox', className: 'checkbox', onclick: (event) => selectionHash.current.click(event.target), attrs: { filename: fileStats.filename, fileType: fileType } },
			{ el: 'img', src: 'images/file-browser-icon.png', style: 'width:2.5rem' },
			{ text: fileStats.filename },
			{ text: modifiedDate },
			{ text: creationDate },
			{ text: fileStats.sizeInBytes },
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
						setElOnclick(tableData, changeDirectory);
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
	ajaxPost('/getfiles', { path: currentPath }, (data) => addFilesToTable(data));
});
