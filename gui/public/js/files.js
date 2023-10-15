function utcToCurrentTime(utcTimeString) {
	const utcDate = new Date(utcTimeString);
	const localDate = new Date(utcDate.localTime());
	const formattedLocalTime = localDate.toTimestamp();
	return formattedLocalTime;
}

function addFilesToTable(fileList) {
	const tableBody = document.querySelector("body > div > div.files > table > tbody.table-group-divider");
	let html = '';

	fileList.forEach((fileStats) => {
		const fileType = fileStats.isDirectory ? "Folder" : fileStats.fileExtension;
		const modifiedDate = utcToCurrentTime(fileStats.modifiedDate);
		const creationDate = utcToCurrentTime(fileStats.creationDate);
		html += `
			<tr>
				<td><input type="checkbox"></td>
				<td><img style="width:2.5em"src="images/file-browser-icon.png"/></td>
				<td>${fileStats.filename}</td>
				<td>${modifiedDate}</td>
				<td>${creationDate}</td>
				<td>${fileStats.sizeInBytes}</td>
				<td>${fileType}</td>
			</tr>`
	});

	tableBody.innerHTML += html;
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
