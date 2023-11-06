function openFile(path) {
	const filename = path.split('/').slice(-2);
	console.log('Tried to open ' + filename);
}

function updateDirectoryBtns(path) {
	const container = document.querySelector("body > div > div.files > div > div.flex-r > div:last-child");
	const newContainer = $(container.outerHTML);
	newContainer.empty();

	let steppingPath = '';
	const buttonList = path.split('/');
	buttonList.pop();
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

function changeDirectory(path) {
	currentPath = path;
	selectionHash.add(currentPath);

	const selectAllEl = document.querySelector("body > div > div.files > table > thead > tr > td > input[type=checkbox]")
	selectAllEl.checked = selectionHash.current.allSelected;

	const input = document.querySelector("body > div > div.files > div > div.flex-0-1 > input");
	input.value = path;

	updateDirectoryBtns(path);
	ajaxPost('/getfiles', { path: path }, data => addFilesToTable(data));
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
		const modifiedDate = new Date().localTime(fileStats.modifiedDate);
		const creationDate = new Date().localTime(fileStats.creationDate);
		const tableRow = document.createElement('tr');
		const els = [
			{ el: 'input', type: 'checkbox', className: 'checkbox', onclick: event => selectionHash.current.click(event.target), attrs: { filename: fileStats.filename, fileType: fileType } },
			{ el: 'img', src: 'images/file-browser-icon.png', style: 'width:2.5rem' },
			{ text: fileStats.filename },
			{ text: modifiedDate },
			{ text: creationDate },
			{ text: fileStats.sizeInBytes },
			{ text: fileType },
		];

		function setElOnclick(el, func) {
			el.onclick = function (event) {
				func(currentPath + fileStats.filename + "/");
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
					if (obj.type == 'checkbox' && selectionHash.current.includesFile(fileStats.filename)) {
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
	createPopUp("message", { title: "Trash", message: "Confirm to enter trash" });
}

$(document).ready(function() {
	ajaxPost('/getfiles', { path: currentPath }, data => addFilesToTable(data));
});

