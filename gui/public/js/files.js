const userDirectory = "james";
let currentPath = userDirectory;

function updateDirectoryButtons(path) {
	const container = document.querySelector("body > div > div.files > div > div.flex-r > div:last-child");
	const newContainer = $(container.outerHTML);
	newContainer.empty();

	let steppingPath = '';
	const buttonList = path.split('/');
	buttonList.forEach( elText => {
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
	currentPath = path;
	const input = document.querySelector("body > div > div.files > div > div.flex-1 > input");
	input.value = path;
}

function openDirectory(path) {
	path = path.replace(/\/$/, '');
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

function addFilesToTable(fileList) {
	const tableBody = document.querySelector("body > div > div.files > table > tbody.table-group-divider");
	const body = $(tableBody.outerHTML);
	body.empty();

	fileList.forEach( fileStats => {
		const fileType = fileStats.isDirectory ? "Folder" : fileStats.fileExtension;
		const modifiedDate = utcToCurrentTime(fileStats.modifiedDate);
		const creationDate = utcToCurrentTime(fileStats.creationDate);
		const tableRow = document.createElement('tr');
		const els = [
			'<input type="checkbox">',
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

		els.forEach( item => {
			const tableData = document.createElement('td');
			if ( item === fileStats.filename ) {
				if ( fileStats.isDirectory ) {
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
