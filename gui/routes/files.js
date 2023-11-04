const fs = require('fs')
const path = require('path');
const async = require('async');
const zip = require('./zip.js');
require('./utils.js');

function getBasename(filename) {
	const parts = filename.split('.');
	parts.pop();
	const basename = parts.join('.');
	return basename;
}

function getDirectorySize(directoryPath, callback) {
	let totalSize = 0;

	function calculateSize(filePath, callback) {
		fs.stat(filePath, (err, stats) => {
			if (err) return callback(err);

			if (stats.isFile()) {
				totalSize += stats.size;
				callback(err, totalSize);
			} else if (stats.isDirectory()) {
				const files = fs.readdirSync(filePath);
				async.each(files, (file, acb) => {
					const subPath = path.join(filePath, file);
					calculateSize(subPath, acb);
				}, (err) => {
					callback(err, totalSize);
				});
			}
		});
	}

	calculateSize(directoryPath, callback);
}

function getListOfFiles(directoryPath, callback) {
	const fileList = [];

	fs.readdir(directoryPath, (err, files) => {
		if (err) return callback(err);

		async.each(files, (file, acb) => {
			const filePath = path.join(directoryPath, file);

			fs.stat(filePath, (err, fileStats) => {
				if (err) return callback(err);

				getDirectorySize(filePath, (err, size) => {
					if (err) return callback(err);

					isDirectory = fileStats.isDirectory();
					fileExtension = isDirectory ? "" : path.extname(file);

					const fileInfo = {
						filename: file,
						modifiedDate: fileStats.mtime,
						creationDate: fileStats.birthtime,
						sizeInBytes: size,
						fileExtension: fileExtension,
						isDirectory: isDirectory,
					};

					fileList.push(fileInfo);
					acb(err);
				});
			});
		}, (err) => {
			callback(err, fileList);
		});
	});
}

exports.setupFiles = function (app) {
	const basePath = path.resolve(__dirname + "/../../") + "/"; // Turns relative path to absolute path. Express relative path is malicious
	const usersPath = basePath + "users/";

	app.post('/getfiles', (req, res) => {
		const directoryPath = usersPath + req.body.path; // Gets directory of user
		getListOfFiles(directoryPath, (err, fileList) => {
			if (err) return res.end(JSON.stringify({ error: "FROM BACKEND\n" + err.toString() }));
			res.end(JSON.stringify({ success: true, data: fileList }));
		});
	});

	app.post('/login', (req, res) => {
		const username = req.body.username;
		const pwd = req.body.password;
		const users = require(basePath + "users.json");
		if (users[username] === undefined || users[username].pwd !== pwd) {
			res.sendFile(basePath + "gui/public/index.html");
			return null;
		}
		res.sendFile(basePath + "gui/public/home.html");
	});

	app.post('/createfile', (req, res) => {
		const path = usersPath + req.body.path;
		const filename = path + req.body.filename;
		fs.writeFile(filename, '', (err) => {
			if (err) return res.end(JSON.stringify({ error: "FROM BACKEND\n" + err.toString() }));
			res.end(JSON.stringify({ success: true, data: filename.split('/').pop() }));
		});
	});
	
	app.post('/createfolder', (req, res) => {
		const path = usersPath + req.body.path;
		const filename = path + req.body.filename;
		fs.mkdir(filename, (err) => {
			if (err) return res.end(JSON.stringify({ error: "FROM BACKEND\n" + err.toString() }));
			res.end(JSON.stringify({ success: true, data: filename.split('/').pop() }));
		});
	});

	app.get('/download*', (req, res) => {
		const type = req.query.type;
		if (type === "file") {
			const filePath = usersPath + decodeURIComponent(req.query.path);
			const filename = filePath.split('/').pop();
			res.setHeader('Content-Type', 'application/force-download');
			res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
			res.sendFile(filePath, { dotfiles: 'allow' });
		} else if (type === "zip") {
			const data = JSON.parse(req.query.data);
			zip.makeZip(data, (zipFile, time) => {
				const name = "filebrowser_" + new Date().utcToCurrentTime(time).replace(/ /g, "_").replace(/:/g, "-");
				res.setHeader('Content-Type', 'application/zip');
				res.setHeader('Content-Disposition', `attachment; filename=${name}`);
				res.sendFile(zipFile, { dotfiles: 'allow' });
			});
		}
	});
}
