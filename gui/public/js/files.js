const userDirectory = "james";
let currentPath = userDirectory;
const selected = {};

function createPopUp(type, options) {
/*
fill-screen flex-justify-center flex-align-center
<div style="background-color: rgba(0, 0, 0, 0.8); position: absolute; inset: 0px; display: flex; justify-content: center; align-items: center;">
<div style="text-align: center; color: rgb(255, 255, 255); display: block; width: auto; background-color: rgba(0, 0, 0, 0.6); padding: 8px; border-radius: 20px; font-size: 2rem;">Select a camera:<div>Inside text</div></div>
</div>
*/
	const divContainer = document.createElement("div");
	divContainer.className = "fill-screen flex-justify-center flex-align-center"
	if (type === "message") {
		
	}
}

function download() {
	const numSelected = Object.keys(selected).length;
	const includesFolder = Object.values(selected).includes("Folder");
	console.log(selected, numSelected, includesFolder);
	if (numSelected === 1 && !includesFolder) {
		console.log("Download: one File");
	} else if (numSelected === 1 && includesFolder) {
		console.log("Download one Folder");
	} else if (numSelected > 1 && includesFolder) {
		console.log("Download " + numSelected + ". True for Folders or Folder && files(s)");
	} else if (numSelected > 1 && !includesFolder) {
		console.log("Download " + numSelected + " Files. No Folders.");
	} else {
		console.log("Nothing selected");
	}
}

function rename() {
	const numSelected = Object.keys(selected).length;
	if (numSelected === 1) {
		const newName = prompt("");
	} else {
		const message = (numSelected === 0 ) ? "Nothing is selected silly. Select one to rename." : "You can only selected one. You tried to rename " + numSelected + "."
		createPopUp("message", message);
	}
}

function addToSelected(el) {
	let key = el.getAttribute("filename");
	let value = el.getAttribute("fileType");
	selected[key] === undefined ? selected[key] = value : (delete selected[key]);
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
		button.onclick = function (e) {
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
	ajaxPostFileListRequest(path);
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
		if (valA === true) console.log("valA", valA, "valB:", valB);
		if (valA === true && valB === false) return -1 * direction;
		if (valA === false && valB === true) return 1 * direction;
		if (valA < valB) return -1 * direction;
		if (valA > valB) return 1 * direction;
		return 0;
	});
}

function addFilesToTable(fileList, sortKey = "filename", sortDirection = 1, lastSortKey="filename") {
	const numFiles = fileList.length;
	document.querySelector("#file-count").textContent = "File Count: " + numFiles;

	const tableBody = document.querySelector("body > div > div.files > table > tbody.table-group-divider");
	const body = $(tableBody.outerHTML);
	body.empty();

	document.querySelector("#" + lastSortKey).classList.remove('selected');
	document.querySelector("#" + sortKey).classList.add('selected');

	sortArrOfObj(fileList, sortKey, sortDirection);
	if (sortKey === "filename") {
		sortArrOfObj(fileList, "fileExtension", sortDirection);
	}

	const sortOptions = document.querySelector("body > div > div.files > div > div.flex-r ul").children;
	Array.from(sortOptions).forEach(el => {
		let value = el.dataset.value;
		el.onclick = e => {
			let column = value;
			let direction = sortDirection;
			if (column === sortKey || direction === -1) { // Change direction if same option. Force back to 1 if changing direction column
				direction = direction * -1;
			}
			addFilesToTable(fileList, column, direction, sortKey);
		};

		document.querySelector("#" + value).onclick = el.onclick; // Sets column onclick to sort option onclick
	});
	
	fileList.forEach(fileStats => {
		const fileType = fileStats.isDirectory ? "Folder" : fileStats.fileExtension;
		const modifiedDate = utcToCurrentTime(fileStats.modifiedDate);
		const creationDate = utcToCurrentTime(fileStats.creationDate);
		const tableRow = document.createElement('tr');
		const els = [
			'<input class="checkbox" type="checkbox" filename="' + fileStats.filename + '" fileType="' + fileType + '" onclick="addToSelected(this)">',
			'<img style="width:2.5em"src="images/file-browser-icon.png"/>',
			fileStats.filename,
			modifiedDate,
			creationDate,
			fileStats.sizeInBytes,
			fileType,
		];

		function setElOnclick(el, func) {
			el.onclick = function (e) {
				func(currentPath + '/' + fileStats.filename);
			}
		}

		els.forEach(item => {
			const tableData = document.createElement('td');
			if (item === fileStats.filename) {
				if (fileStats.isDirectory) {
					setElOnclick(tableData, openDirectory);
				} else {
					setElOnclick(tableData, openFile);
				}
			}
			tableData.innerHTML = item;
			tableRow.appendChild(tableData);
		});
		body.get(0).appendChild(tableRow);
		// tableBody.appendChild(tableRow);
	});

	const table = document.querySelector("body > div > div.files > table");
	table.removeChild(tableBody);
	table.appendChild(body.get(0));
}

function ajaxPostFileListRequest(path) {
	$.ajax({
		url: '/files',
		method: 'POST',
		dataType: 'json',
		data: { user: path },
		success: function(data) {
			if (data.error) return console.error(data.error);
			addFilesToTable(data);
		},
		error: function() {
			console.error("Couldn't get files");
		}
	});
}

$(document).ready(function() {
	ajaxPostFileListRequest(userDirectory);
});
