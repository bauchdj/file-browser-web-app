function options({ numSelected, route, title, message, cbTitle, cbMessage }) {
	if (numSelected === 0) {
		createPopUp("message", { title: title, message: "Nothing is selected silly. Select something to move." });
		return;
	}

	const data = selectionHash.files();

	createPopUp("options", { title: title, message: message, btns: { primary: [ { text: title } ] }, callback: event => {
		if (selectionHash.clear) {
			selectionHash.clear();
		}

		ajaxPost(route, { data: data, count: numSelected }, postValue => {
			const message = cbMessage({ postValue: postValue });

			console.log(message);

			createPopUp("message", { title: cbTitle({ postValue: postValue }), message: message, callback: () => { 
				ajaxPost('/getfiles', { path: currentPath }, data => addFilesToTable(data));
			}});
		});
	}});
}

function trash(event) {
	const numSelected = selectionHash.length();
	const filenames = selectionHash.filenames();

	options({
		numSelected: numSelected,
		route: '/trash',
		title: "Trash",
		message: `Confirm trashing of ${numSelected}. Files include: "${filenames.join(', ')}"`,
		cbTitle: ({ value, postValue }) => "Trashed files",
		cbMessage: ({ value, postValue }) => `Trashed "${filenames.join(', ')}"`,
	});
}

function del(event) {
	const numSelected = selectionHash.length();
	const filenames = selectionHash.filenames();

	options({
		numSelected: numSelected,
		route: '/delete',
		title: "Delete",
		message: `Confirm permanent deletion of ${numSelected}. Files include: "${filenames.join(', ')}"`,
		cbTitle: ({ value, postValue }) => "Deleted files",
		cbMessage: ({ value, postValue }) => `Deleted "${filenames.join(', ')}"`,
	});
}

function search(event) {
	const el = event.target;
	const input = el.value;

	if (input === undefined) return false;

	if (!document.querySelector("#clear-search-btn")) {
		const text = "Clear search results";
		const title = "Clear search results reloading current directory";
		const btn = pathActionBtn(text, title, event => {
			btn.el.remove();
			el.value = '';
			addFilesToTable(Object.values(filesHash))
		});
		btn.el.setAttribute("id", "clear-search-btn");
	}

	const regex = (input => {
		try {
			const pattern = input.replace(/(^\/)|(\/[a-z]*$)/g, '');
			const flags = input.match(/[^/]+$/)[0];
			const regex = new RegExp(pattern, flags);
			return regex;
		} catch (err) {
			return new RegExp(input);
		}
	})(input);

	const filteredFiles = Object.values(filesHash).filter(fileStats => regex.test(fileStats.filename));

	if (document.querySelector("#subfolder-search").checked) {
		// ajax call: req with regex, res adds file to table
		console.log("Backend subfolder search")
	} else {
		addFilesToTable(filteredFiles);
	}
}

function downloadFiles(files, num) {
	let time = 0;
	while (num-- > 0) {
		const path = selectionHash.next(files);
		const a = document.createElement('a');
		a.href = `/download?type=file&path=${encodeURIComponent(path)}`;
		setTimeout(() => {
			a.click();
		}, time);
		time += 1000;
	}
}

function downloadZip(files) {
	const a = document.createElement('a');
	a.href = `/download?type=zip&data=${encodeURIComponent(JSON.stringify(files))}`;
	a.click();
}

function download(event) {
	const numSelected = selectionHash.length();
	const title = "Download";
	const includesFolder = !selectionHash.onlyFiles();
	const files = selectionHash.files();
	const filenames = selectionHash.filenames();

	if (numSelected == 0) {
		console.log("Nothing is selected silly. Select something to download.");
		createPopUp("message", { title: "Attempted to Download", message: "Nothing selected" });
		return;
	} else if (!includesFolder) {
		const message = numSelected === 1 ? "How you like to download this file?" : `How would you like to download these ${numSelected} files: ${filenames.join(', ')}`;

		const btns = {
			primary: [
				{ text: "Zip", callback: event => downloadZip(files) },
				{ text: "Raw file(s)", callback: event => downloadFiles(files, numSelected) },
			]
		};

		createPopUp("options", { title: title + (numSelected === 1 ? '' : ` - ${numSelected} files`), message: message, btns: btns, callback: event => {
			if (selectionHash.clear) {
				selectionHash.clear();
			}
			createPopUp("message", { title: "Downloading file / files", message: `Currently preparing zip or downloading file / files: "${filenames.join(', ')}"` });
		}});
	} else {
		const message = `Would you like to download all ${numSelected}: ${filenames.join(', ')}`;

		const btns = {
			primary: [
				{ text: "Zip", callback: event => downloadZip(files) },
			]
		};

		createPopUp("options", { title: `${title} - ${numSelected} items`, message: message, btns: btns, callback: event => {
			if (selectionHash.clear) {
				selectionHash.clear();
			}
			createPopUp("message", { title: "Downloading folder", message: `Currently preparing zip for download: "${filenames.join(', ')}"` });
		}});
	}
}

function input({ route, type, data, filename, inputType, title, message, cbTitle, cbMessage }) {
	createPopUp("input", { title: title, message: message, filename: filename, inputType: inputType, callback: value => {
		if (selectionHash.clear) {
			selectionHash.clear();
		}

		ajaxPost(route, { path: currentPath, type: type, data: data, name: value, count: 1 }, postValue => {
			const message = cbMessage({ value: value, postValue: postValue });

			console.log(message);

			createPopUp("message", { title: cbTitle({ value: value, postValue: postValue }), message: message, callback: () => { 
				ajaxPost('/getfiles', { path: currentPath }, data => addFilesToTable(data));
			}});
		});
	}});
}

function createTextFile(event) {
	input({
		route: '/create', 
		type: "file",
		title: "Create file",
		message: "Type filename",
		cbTitle: ({ value, postValue }) => "Created a file",
		cbMessage: ({ value, postValue }) => `New file: "${postValue}"`,
	});
}

function createFolder(event) {
	input({
		route: '/create', 
		type: "folder",
		title: "Create folder",
		message: "Type folder name",
		cbTitle: ({ value, postValue }) => "Created a folder",
		cbMessage: ({ value, postValue }) => `New file: "${postValue}"`,
	});
}

function downloadURL(event) {
	const title = "Download directly to server";
	const message = "Enter URL to download file or folder to current directory";
	input({
		route: '/downloadURL',
		type: "url",
		title: title,
		message: message,
		cbTitle: ({ value, postValue }) => "Downloaded from URL",
		cbMessage: ({ value, postValue }) => `Downloaded: "${postValue}" from "${value}"`,
	});
}

function rename(event) {
	const numSelected = selectionHash.length();
	const title = "Rename";
	if (numSelected !== 1) {
		const message = (numSelected === 0 ) ? "Nothing is selected silly. Select one to rename." : "You can only select one. You tried to rename " + numSelected + ".";
		createPopUp("message", { title: title, message: message });
		return;
	}
	const message = "Type new name";
	input({
		route: '/rename',
		data: selectionHash.files(),
		filename: selectionHash.filenames()[0],
		inputType: "filename",
		title: title,
		message: message,
		cbTitle: ({ value, postValue }) => "Rename",
		cbMessage: ({ value, postValue }) => `Renamed: "${value}" to "${postValue}"`,
	});
}

function createLink(event) {
	const title = "Create Shareable Link";
	if (selectionHash.length() === 0) {
		createPopUp("message", { title: title, message: "Nothing is selected silly. Select files to share." });
		return;
	}
	const message = "Type link name";
	input({
		route: '/createLink',
		data: selectionHash.files(),
		title: title,
		message: message,
		cbTitle: ({ value, postValue }) => "Created sharable link",
		cbMessage: ({ value, postValue }) => `Created link: "${value}"`,
	});
}

function navAction({ numSelected, route, title, message, cbTitle, cbMessage }) {
	if (numSelected === 0) {
		createPopUp("message", { title: title, message: "Nothing is selected silly. Select something." });
		return;
	}

	const data = selectionHash.files();

	pathNavBtn(title, value => {
		createPopUp("options", { title: title, message: message({ value: value }), btns: { primary: [ { text: title } ] }, callback: event => {
			selectionHash.clear();

			ajaxPost(route, { data: data, path: value, count: numSelected }, postValue => {
				// postValue is results object from backend, need to loop and add each corresponding result based by looping through postValue using ${data} (aka filenames) list as keys. That way we add the files to the pop up message in the order they were sent. Otherwise they'll be grouped by success and error. I guess we could group them by success and error, we can try that first and see how it looks. None should technically error because I rename them until it works lol
				const message = cbMessage({ value: value, postValue: postValue });

				console.log(message);

				createPopUp("message", { title: cbTitle({ value: value, postValue: postValue }), message: message, callback: () => { 
					ajaxPost('/getfiles', { path: currentPath }, data => addFilesToTable(data));
				}});
			});
		}});
	});
}

function move(event) {
	const numSelected = selectionHash.length();
	const filenames = selectionHash.filenames();

	navAction({
		numSelected: numSelected,
		route: '/rename',
		title: "Move",
		message: ({ value }) => `Confirm move of ${numSelected} to "${value}". Files include: "${filenames.join(', ')}"`,
		cbTitle: ({ value, postValue }) => "Moved files",
		cbMessage: ({ value, postValue }) => `Moved: "${filenames.join(', ')}" to "${postValue}"`,
	});
}

function copy(event) {
	const numSelected = selectionHash.length();
	const filenames = selectionHash.filenames();

	navAction({
		numSelected: numSelected,
		route: '/copy',
		title: "Copy",
		message: ({ value }) => `Confirm copy of ${numSelected} to "${value}". Files include: "${filenames.join(', ')}"`,
		cbTitle: ({ value, postValue }) => "Copied files",
		cbMessage: ({ value, postValue }) => `Copied: "${filenames.join(', ')}" to "${postValue}"`,
	});
}

function symbolicLink(event) {
	const numSelected = selectionHash.length();
	const filenames = selectionHash.filesnames();

	navAction({
		numSelected: numSelected,
		route: '/symlink',
		title: "Symbolic Link",
		message: ({ value }) => `Confirm symbolic link of ${numSelected} to "${value}". Files include: "${filenames.join(', ')}"`,
		cbTitle: ({ value, postValue }) => "Symlinked files",
		cbMessage: ({ value, postValue }) => `Symbolically linked: "${filenames.join(', ')}" to "${postValue}"`,
	});
}

function upload(event) {
	const title = "Upload";
	const message = "";//"Choose file or folder upload";

	const fileInput = {
		tag: "input",
		type: "file",
		multiple: true,
		onchange: event => console.log("Selected files"),
	};

	const folderInput = {
		tag: "input",
		type: "file",
		webkitdirectory: true,
		directory: true,
		multiple: true,
		onchange: event => console.log("Selected folder"),
	};

	function divText(text) {
		const div = {
			tag: "div",
			text: text,
			style: { alignSelf: "center", fontWeight: "bold" },
		}

		return div;
	}

	const inputs = {
		tag: "div",
		"class": "flex-c",
		children: [ divText("Files"), fileInput, divText("Folder"), folderInput ],
	};

	function sendFiles() {
		const files = Array.from(fileInput.el.files).concat(Array.from(folderInput.el.files));

		if (files.length === 0) return createPopUp("message", { title: title, message: "Nothing selected for upload" });

		const formData = new FormData();

		formData.append("path", currentPath);

		files.forEach(file => {
			formData.append('files[]', file, file.webkitRelativePath || file.name);
		});

		for (let [key, value] of formData.entries()) {
			console.log(key, value);
		}

		const xhr = new XMLHttpRequest();

		xhr.open('POST', '/upload', true);

		xhr.onload = function () {
			if (xhr.status === 200) {
				createPopUp("message", { title: "Upload completed", message: "Successfully uploaded selected files / folder", callback: () => {
					ajaxPost('/getfiles', { path: currentPath }, data => addFilesToTable(data));
				}});
			} else {
				createPopUp("message", { title: "Upload completed", message: "Upload error. Status: " + xhr.status });
			}
		};

		xhr.send(formData);
	}

	createPopUp("options", { title: title, message: message, btns: { primary: [ { text: "Upload" } ] }, bodyChildren: [ inputs ], callback: event => sendFiles() });
}

