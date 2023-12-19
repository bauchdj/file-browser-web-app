function getJoke(event) {
	const el = event.target;
	const url = "https://api.chucknorris.io/jokes/random?category=dev";
	fetch(url)
		.then(res => res.json())
		.then(out => createPopUp("message", { title: "Joke", message: out.value }))
		.catch(err => console.error("No joke:", err));
}

function openFile(path) {
	const filename = path.split('/').slice(-2);
	console.log('Tried to open ' + filename);
}

function updateDirectoryBtns(path) {
	document.querySelector("#filePathButtons").remove();
	const container = {
		tag: "div",
		id: "filePathButtons",
		"class": "flex-r flex-0-1 overflow-x-auto",
		children: [],
	}

	const buttonList = path.split('/');
	buttonList.pop();

	let steppingPath = '';
	buttonList.forEach(elText => {
		steppingPath += elText + '/';
		let jumpToPath = steppingPath;

		const btn = {
			tag: "button",
			"class": "btn",
			text: elText,
			onclick: event => changeDirectory(jumpToPath),
		}

		const div = {
			tag: "div",
			"class": "center-y",
			text: '/',
		}

		container.children.push(btn, div);
	});

	const parent = document.querySelector("body > div > div.files > div > div.flex-r");
	jsl.dom.add(parent, container);
}

function changeDirectory(path) {
	currentPath = path;
	selectionHash.add(currentPath);

	const selectAllEl = document.querySelector("body > div > div.files > table > thead > tr > td > input[type=checkbox]")
	selectAllEl.checked = selectionHash.current.allSelected;

	const input = document.querySelector("body > div > div.files > div > div.flex-0-1 > input");
	input.value = path;

	updateDirectoryBtns(path);
	getFiles();
}

function sortArrayOfObjects(arr, key, direction = 1) {
	function sortLowerCase(arr) {
		arr.sort((a, b) => {
			// Sort list of objects OR list of strings, ints, floats
			let valA = a[key] !== undefined ? a[key] : a;
			let valB = b[key] !== undefined ? b[key] : b;

			if (valA === valB) return 0; // Short circuit if they're equal

			if (valA.toLowerCase) {
				valA = valA.toLowerCase();
			}
			if (valB.toLowerCase) {
				valB = valB.toLowerCase();
			}

			if (valA === valB) return 0; // Short circuit if equal after lower case
			if (valA < valB) return -1 * direction;
			if (valA > valB) return 1 * direction;
		});

		return arr;
	}

	function mapFiles(arr) {
		const map = {};

		arr.forEach(file => {
			const fileType = file.isDirectory ? "folder" : file.fileExtension;

			if (!map[fileType]) {
				map[fileType] = [];
			}

			map[fileType].push(file);
		});

		return map;
	}

	if (key === "filename") {
		const extMap = mapFiles(arr);

		// Separate folders, if folder exists
		const folders = extMap.folder ? extMap.folder : [];
		delete extMap.folder;

		// Flatten map to list
		const keys = Object.keys(extMap);
		const files = keys.flatMap(key => extMap[key]);

		// Sort 
		const sortedFolders = sortLowerCase(folders);
		const sortedFiles = sortLowerCase(files);

		// Combine sorted folders and sorted files
		const sorted = sortedFolders.concat(sortedFiles);

		return sorted;
	}

	if (key === "fileExtension") {
		const extMap = mapFiles(arr);

		// Sort each list in map
		for (const key in extMap) {
			sortLowerCase(extMap[key]);
		}

		// Separate folders, if folder exits
		const folders = extMap.folder ? extMap.folder : [];
		delete extMap.folder;

		// Sort then flatten map to list
		const sortedKeys = sortLowerCase(Object.keys(extMap));
		const files = sortedKeys.flatMap(key => extMap[key]);

		// Concat folders with files
		const sorted = folders.concat(files);

		return sorted;
	}

	return sortLowerCase(arr);
}

let fileTypeToClassName = {};
function getFileTypeToFontAwesomeObj() {
	const xhr = new XMLHttpRequest();
	xhr.onreadystatechange = () => {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				const data = JSON.parse(xhr.responseText);
				fileTypeToClassName = data;
			} else {
				console.error('Error loading JSON:', xhr.statusText);
			}
		}
	};
	xhr.open('GET', '/json/fileType-to-FontawesomeClass.json', true);
	xhr.send();
}
getFileTypeToFontAwesomeObj();


function addFilesToTable(fileList, sortKey = "filename", sortDirection = 1, lastSortKey = "filename") {
	const row = document.querySelector("body > div > div.files > table > thead > tr");
	const columns = Array.from(row.children)
	columns.forEach(el => el.classList.remove('selected'));
	document.querySelector("#" + sortKey).classList.add('selected');

	fileList = sortArrayOfObjects(fileList, sortKey, sortDirection);
	//if (sortKey === "filename") {
	//	sortArrayOfObjects(fileList, "fileExtension", sortDirection);
	//}

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
		const modifiedDate = new Date().localTime(fileStats.modifiedDate);
		const creationDate = new Date().localTime(fileStats.creationDate);
		const tableRow = document.createElement('tr');
		const fileTypeClass = fileTypeToClassName[fileStats.fileExtension.toLowerCase()];
		const iconClass = 'fa-regular ' + (fileTypeClass != undefined ? fileTypeClass : 'fa-file')
		const els = [
			{ el: 'input', type: 'checkbox', className: 'checkbox', onclick: event => selectionHash.current.click(event.target), attrs: { filename: fileStats.filename, fileType: fileStats.fileExtension } },
			//{ parent: { el: 'div' }, el: 'i', className: iconClass },
			{ el: 'i', className: iconClass },
			{ text: fileStats.filename },
			{ text: modifiedDate },
			{ text: creationDate },
			{ text: fileStats.sizeInBytes },
			{ text: fileStats.fileExtension },
		];

		function setElOnclick(el, func) {
			el.onclick = function (event) {
				func(currentPath + fileStats.filename + "/");
			}
		}

		els.forEach(obj => {
			const tableData = document.createElement('td');

			if (Object.keys(obj).length === 1 && obj.text) {
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
				if (obj.parent) {
					const p = document.createElement(obj.parent.el);
					if (obj.parent.className) p.className = obj.parent.className;
					p.appendChild(el);
					tableData.appendChild(p);
				}
				if (obj.type) el.type = obj.type;
				if (obj.src) el.src = obj.src;
				if (obj.className) el.className = obj.className;
				if (obj.style) el.style = obj.style;
				if (obj.onclick) el.onclick = obj.onclick;
				if (obj.attrs) {
					Object.keys(obj.attrs).forEach(attr => {
						el.setAttribute(attr, obj.attrs[attr]);
					});
					if (obj.type === 'checkbox' && selectionHash.current.includesFile(fileStats.filename)) {
						selectionHash.current.items[fileStats.filename].el = el;
						el.checked = true;
					}
				}

				if (!obj.parent) tableData.appendChild(el);
			}

			tableRow.appendChild(tableData);
		});

		newTableBody.appendChild(tableRow);

		if (!filesHash[fileStats.filename]) {
			filesHash[fileStats.filename] = fileStats;
		}
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
		success: rsp => {
			if (rsp.error || !rsp.success) return onerror ? onerror(rsp.error) : console.error(rsp.error);
			callback(rsp.data);
		},
		error: function(err) {
			console.error(err);
		}
	});
}

function openShared(event) { // Both shared and trash will remove path input and request the shared or trash directories. The backend will handle what is sent and displayed
	createPopUp("message", { title: "Shared", message: "Confirm to enter shared" });
}

function openTrash(event) {
	changeDirectory(localStorage.getItem('user') + "/.trash/");
}

function getFiles() {
	ajaxPost('/getfiles', { path: currentPath }, data => {
		filesHash = {};
		currentFileCount = data.length;
		addFilesToTable(data)
	});
}

$(document).ready(function() {
	getFiles();
});

