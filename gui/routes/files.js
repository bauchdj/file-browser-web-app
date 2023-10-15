const fs = require('fs')
const path = require('path');
const async = require('async');

function getDirectorySize(directoryPath, callback) {
	let totalSize = 0;

	function calculateSize(filePath, callback) {
		fs.stat(filePath, (error, stats) => {
			if (stats.isFile()) {
				totalSize += stats.size;
				callback(null, totalSize);
			} else if (stats.isDirectory()) {
				const files = fs.readdirSync(filePath);
				async.each(files, (file, acb) => {
					const subPath = path.join(filePath, file);
					calculateSize(subPath, acb);
				}, (err) => {
					callback(null, totalSize);
				});
			}
		});
	}

	calculateSize(directoryPath, callback);
}

function getListOfFiles(directoryPath, callback) {
	const fileList = [];

	fs.readdir(directoryPath, (err, files) => {
		if (err) {
			console.error('Error reading directory:', err);
			return;
		}
		async.each(files, (file, acb) => {
			const filePath = path.join(directoryPath, file);
			fs.stat(filePath, (error, fileStats) => {
				getDirectorySize(filePath, (err, size) => {
					const fileInfo = {
						filename: file,
						modifiedDate: fileStats.mtime,
						creationDate: fileStats.birthtime,
						// sizeInBytes: fileStats.size,
						sizeInBytes: size,
						fileExtension: path.extname(file).toLowerCase(),
						isDirectory: fileStats.isDirectory(),
					};

					fileList.push(fileInfo);
					acb(null);
				});
			});
		}, (err) => {
			callback(null, fileList);
		});
	});
}

const directoryPath = "/Users/djbauch/git/startup-file-browser-web-app/users/james/";
/*
getListOfFiles(directoryPath, (err, fileList) => {
	console.log(fileList);
	process.exit();
});
*/

exports.setupFiles = function (app) {
	app.post('/files', (req, res) => {
		const directoryPath = "/Users/djbauch/git/startup-file-browser-web-app/users/" + req.body.user + "/";
		getListOfFiles(directoryPath, (err, fileList) => {
			res.end(JSON.stringify(fileList));
		});
	});
}
