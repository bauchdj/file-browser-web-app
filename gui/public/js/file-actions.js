	/*
	createPopUp("input", { title: title, message: message, inputType: "filename", callback: filename => {
	createPopUp("input", { title: title, message: message, inputType: "url", callback: url => {
	createPopUp("input", { title: title, message: message, file: filename, inputType: "filename", callback: newFilename => {
	createPopUp("input", { title: title, message: message, inputType: "link", callback: linkName => {
	createPopUp("input", { title: title, message: message, file: filename, inputType: "filename", callback: linkName => {
	*/

function input(route, title, message, type, inputType, filename) {
	createPopUp("input", { title: title, message: message, file: filename, inputType: inputType, callback: value => {
		ajaxPost(route, { path: currentPath, filename: value }, postValue => {
			const message = `New file: "${postValue}"`;
			console.log(message);
			createPopUp("message", { title: `Created ${type}`, message: message, callback: () => { 
				ajaxPost('/getfiles', { path: currentPath }, data => addFilesToTable(data));
			}});
		});
	}});
}

function createTextFile(event) {
	input('createFile', "Create file", "Type filename", "file");
}

function createFolder(event) {
	input('/createfolder', "Create folder", "Type folder name", "folder");
}

function downloadURL(event) {
	const title = 'Download directly to server';
	const message = 'Enter URL to download file or folder to current directory';
	createPopUp("input", { title: title, message: message, inputType: "url", callback: url => {
		console.log('Will make ajax for downloading file / folder to server. Could be dangerous');
		// Need to add /downloadURL to backend and handle the url and filename that is used for downloaded file
		/*
		ajaxPost('/downloadURL', { path: currentPath, url: url }, filename => {
			const message = `Downloaded: "${filename}" from "${url}"`;
			console.log(message);
			createPopUp("message", { title: "Downloaded from URL", message: message, callback: () => { 
				ajaxPost('/getfiles', { path: currentPath }, data => addFilesToTable(data));
			} });
		});
		*/
	}});
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
		const message = `How you like to download this file or files?`;
		const btns = {
			primary: [
				{ text: "Zip", callback: event => downloadZip(files) },
				{ text: "Raw file(s)", callback: event => downloadFiles(files, numSelected) },
			]
		}
		createPopUp("options", { title: title, message: message, btns: btns, callback: event => {
			createPopUp("message", { title: "Downloading file / files", message: `Currently preparing zip or downloading file / files: "${filenames.join(', ')}"` });
		}});
	} else {
		const message = `Would you like to download all ${numSelected}: ${filenames.join(', ')}`;
		const btns = {
			primary: [
				{ text: "Zip", callback: event => downloadZip(files) },
			]
		}
		createPopUp("options", { title: `${title} - ${numSelected} items`, message: message, btns: btns, callback: event => {
			createPopUp("message", { title: "Downloading folder", message: `Currently preparing zip for download: "${filenames.join(', ')}"` });
		}});
	}
}

function rename(event) {
	const numSelected = selectionHash.length();
	const title = "Rename";
	if (numSelected !== 1) {
		const message = (numSelected === 0 ) ? "Nothing is selected silly. Select one to rename." : "You can only select one. You tried to rename " + numSelected + ".";
		createPopUp("message", { title: title, message: message });
		return;
	}
	const file = selectionHash.files();
	const message = "Type new name";
	createPopUp("input", { title: title, message: message, file: filename, inputType: "filename", callback: newFilename => {
		console.log(`Renamed "${filename}" to "${newFilename}"`);
		/*
		ajaxPost('/rename', { path: path, filename: filename }, () => {
			const message = `Renamed: "${filename}" to "${newFilename}"`;
			console.log(message);
			createPopUp("message", { title: "Renamed", message: message, file: filename, callback: () => {
				ajaxPost('/getfiles', { path: currentPath }, data => addFilesToTable(data));
			}});
		});
		*/
	}});
}

function createLink(event) {
	const title = "Create Shareable Link";
	if (selectionHash.length() === 0) {
		createPopUp("message", { title: title, message: "Nothing is selected silly. Select files to share." });
		return;
	}
	const files = selectionHash.files();
	const filenames = selectionHash.filenames();
	const message = "Type link name";
	createPopUp("input", { title: title, message: message, inputType: "link", callback: linkName => {
		console.log(`Created link: "${linkName}"`);
		/*
		ajaxPost('/createLink', { files: files }, () => {
			const message = `Created link: "${linkName}"`;
			console.log(message);
			createPopUp("message", { title: "Created Sharable Link", message: message, callback () => {
				ajaxPost('/getfiles', { path: currentPath }, data => addFilesToTable(data));
			}});
		});
		*/
	}});
}

function search(event) {
	const el = event.srcElement[0];
	const input = el.value;
	if (input === undefined || input === '') return false;
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
	pathNavBtn("Clear search results", selectionHash, path => {
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
	const title = "Move";
	if (selectionHash.length() === 0) {	
		createPopUp("message", { title: title, message: "Nothing is selected silly. Select something to move." });
		return;
	}
	const files = selectionHash.files();
	const filenames = selectionHash.filenames();
	pathNavBtn(title, selectionHash, newPath => {
		// Check if any of the files names exist in newPath && if any of selected have same name (between different directories)
		const message = `Confirm move of "${filenames.join(', ')}"`;
		createPopUp("message", { title: title, message: message, callback: () => {
			console.log(`Request backend to move ${filenames.join(', ')} to "${newPath}"`);
			/*
			ajaxPost('/move', { files: files, newPath: newPath }, () => {
				const message = `Moved "${filenames.join(', ')}" to "${newPath}"`;
				console.log(message);
				createPopUp("message", { title: "Moved files", message: message, callback: () => { 
					ajaxPost('/getfiles', { path: currentPath }, data => addFilesToTable(data));
				}});
			});
			*/
		}});
	});
}

function copy(event) {
	const title = "Copy";
	if (selectionHash.length() === 0) {	
		createPopUp("message", { title: title, message: "Nothing is selected silly. Select something to copy." });
		return;
	}
	const files = selectionHash.files();
	const filenames = selectionHash.filenames();
	pathNavBtn(title, selectionHash, newPath => {
		const message = `Confirm copy of "${filenames.join(', ')}"`;
		createPopUp("message", { title: title, message: message, callback: () => {
			console.log(`Request backend to copy "${filenames.join(', ')}" to "${newPath}"`);
			/*
			ajaxPost('/copy', { files: files, newPath: newPath }, () => {
				const message = `Copied "${filenames.join(', ')}" to "${newPath}"`;
				console.log(message);
				createPopUp("message", { title: "Copied files", message: message, callback: () => { 
					ajaxPost('/getfiles', { path: currentPath }, data => addFilesToTable(data));
				}});
			});
			*/
		}});
	});
}

function symbolicLink(event) {
	const numSelected = selectionHash.length();
	const title = "Symbolic Link";
	if (selectionHash.length() === 0) {	
		createPopUp("message", { title: title, message: "Nothing is selected silly. Select something to copy." });
		return;
	}
	const files = selectionHash.files();
	const filenames = selectionHash.filenames();
	pathNavBtn(title, selectionHash, newPath => {
		const message = `Confirm copy of "${filenames.join(', ')}"`;
		createPopUp("message", { title: title, message: message, callback: () => {
			console.log(`Request backend to copy "${filenames.join(', ')}" to "${newPath}"`);
			/*
			ajaxPost('/copy', { files: files, newPath: newPath }, () => {
				const message = `Copied "${filenames.join(', ')}" to "${newPath}"`;
				console.log(message);
				createPopUp("message", { title: "Copied files", message: message, callback: () => { 
					ajaxPost('/getfiles', { path: currentPath }, data => addFilesToTable(data));
				}});
			});
			*/
		}});
	});
	if (selectionHash.length() == 1) { // Make it work with multiple, like move and copy
		const file = selectionHash.files();
		pathNavBtn(title, selectionHash, newPath => {
			const message = "Type name of link";
			createPopUp("input", { title: title, message: message, file: filename, inputType: "filename", callback: linkName => {
				console.log("Request to create symbolic link " + filename + " " + linkName, `Path: ${path}, newPath: ${newPath}`);
				/*
				ajaxPost('/symbolicLink', { path: path, newPath: newPath, filename: filename, linkName: linkName }, linkName => {
					const message = `Symbollically linked: "${filename}" to "${linkName}"`;
					console.log(message);
					createPopUp("message", { title: "Created symbolic link", message: message, callback: () => {
						ajaxPost('/getfiles', { path: currentPath }, data => addFilesToTable(data));
					}});
				});
				*/
			}});
		});
	}
}

function trash(event) {
	createPopUp("message", { title: "Trash", message: "Confirm to enter trash" });
}

function del(event) {
	createPopUp("message", { title: "Delete", message: "Confirm to permenantely delete" });
}

function upload(event) {
	event.preventDefault();
	createPopUp("message", { title: "Upload", message: "Confirm upload of selected file(s) / folder(s)" });

	/*
	<form id="uploadForm" enctype="multipart/form-data">
		<input type="file" id="folderInput" webkitdirectory="" directory="" multiple />
		<input type="submit" value="Upload and Zip Folder" />
	</form>
	const folderInput = document.getElementById("folderInput"); // Need input element for files list

	if (!folderInput.files.length) {
		alert("Please select a folder to upload.");
		return;
	}

	const zip = new JSZip();
	let filesProcessed = 0;

	for (const folder of folderInput.files) {
		const reader = new FileReader();

		reader.onload = function (event) {
			zip.file(folder.webkitRelativePath, event.target.result);

			filesProcessed++;

			if (filesProcessed === folderInput.files.length) {
				const zip = new JSZip();

				// Add files to the zip object here (e.g., using zip.file())
				zip.generateAsync({ type: "blob", mimeType: "application/zip" }, function (content) {
					// 'content' is the generated zip content as a Blob
					const formData = new FormData();
					formData.append("zipFile", content, "folder.zip");

					$.ajax({
						url: "/upload",
						method: "POST",
						data: formData, // formData
						processData: false,
						contentType: false,
						success: function (response) {
							console.log("Upload successful");
						},
						error: function (error) {
							console.error("Upload failed: ", error);
						},
					});
				});
			}
		};

		reader.readAsArrayBuffer(folder);
	}
	*/
}

