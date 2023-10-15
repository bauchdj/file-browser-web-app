function utcToCurrentTime(utcTimeString) {
	const utcDate = new Date(utcTimeString);
	const localDate = new Date(utcDate.localTime());
	const formattedLocalTime = localDate.toTimestamp();
	return formattedLocalTime;
}

function addFilesToTable(fileList) {
	const tableBody = document.querySelector("body > div > div.files > table > tbody.table-group-divider");
	const body = $(tableBody.outerHTML);
	body.html();

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
		els.forEach( e => {
			const tableData = document.createElement('td');
			tableData.innerHTML = e;
			tableRow.appendChild(tableData);
		});
		body.get(0).appendChild(tableRow);
		// tableBody.appendChild(tableRow);
	});

	const table = document.querySelector("body > div > div.files > table");
	table.removeChild(tableBody);
	table.appendChild(body.get(0));
}

const userDirectory = "james";

$(document).ready(function() {
	$.ajax({
		url: '/files',
		method: 'POST',
		dataType: 'json',
		data: { user: userDirectory },
		success: function(data) {
			addFilesToTable(data);
		},
		error: function() {
			console.error("Couldn't get files");
		}
	});
});
