const https = require('https');
const fs = require('fs-extra');
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

exports.fileRoutes = function (app) {
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
			return;
		}

		res.sendFile(basePath + "gui/public/home.html");
	});

	app.post('/create', (req, res) => {
		const type = req.body.type;
		const isFile = type === "file";

		const path = usersPath + req.body.path;
		const name = req.body.name;
		const filePath = path + name + (isFile ? ".txt" : '');

		const cb = (err) => {
			if (err) return res.end(JSON.stringify({ error: "FROM BACKEND\n" + err.toString() }));
			res.end(JSON.stringify({ success: true, data: name }));
		}

		if (isFile) {
			fs.writeFile(filePath, '', cb);
		} else {
			fs.mkdir(filePath, cb);
		}
	});

	app.post('/downloadURL', (req, res) => {
		const onError = err => {
			console.log(err);
			res.end(JSON.stringify({ error: 'FROM BACKEND\n' + err.toString() }));
		};

		const url = new URL(req.body.name);

		const options = {
			method: 'GET',
			hostname: url.hostname,
			path: url.pathname + url.search,
			headers: {
				host: url.hostname,
				authority: url.hostname,
			}
		};

		function getName(response) {
			const contentDisposition = response.headers['content-disposition'];

			if (contentDisposition) {
				const regexp = /filename=\"(.*)\"/gi;
				const match = regexp.exec(contentDisposition);
				if (match) {
					return match[1];
				}
			}

			const date = new Date();
			const time = date.getTime();
			const contentType = response.headers['content-type'];
			const fileType = "." + contentType.split(';')[0].split('/').pop();
			const name = "server-download-" + date.utcToCurrentTime(time).replace(/ /g, "_").replace(/:/g, "-") + fileType;

			return name;
		}

		let redirectCount = 0;
		const redirectLimit = 10;

		function redirect(url) {
			const r = https.request(options, response => {
				if (redirectCount < redirectLimit && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
					redirectCount++;
					redirect(response.headers.location);
					r.abort();
					return;
				}

				if (redirectCount == redirectLimit) {
					res.writeHead(response.statusCode, response.headers);
					response.pipe(res);
					return;
				}

				if (response.statusCode === 200) {
					const name = getName(response);
					const path = req.body.path;
					const filePath = usersPath + path + name;

					const fws = fs.createWriteStream(filePath);
					response.pipe(fws);

					fws.on('finish', () => {
						console.log('Downloaded:', filePath);
						res.end(JSON.stringify({ success: true, data: name }));
					});

					fws.on('error', err => onError(err));
				} else {
					res.writeHead(response.statusCode, response.headers);
					response.pipe(res);
				}
			});

			r.on('error', err => onError(err));
			r.end();
		}

		redirect(url);
	});

	app.post('/rename', (req, res) => {
		const data = req.body.data;
		const name = req.body.name;

		for (const path in data) {
			for (const file in data[path]) {
				const source = usersPath + path + file;
				const destination = usersPath + req.body.path + (name ? name : file);
				console.log(source, 'to', destination);
				/*
				fs.rename(source, destination, err => {
					if (err) return res.end(JSON.stringify({ error: "FROM BACKEND\n" + err.toString() }));
					res.end(JSON.stringify({ success: true, data: name }));
				});
				*/
			}
		}
		//res.end(JSON.stringify({ success: true, data: req.body.name }));
		return;
	});

	app.post('/createLink', (req, res) => {
		const data = req.body.data;
		const name = req.body.name;
		const linksPath = usersPath + ".shared/";
		const destination = linksPath + name;

		for (const path in data) {
			for (const file in data[path]) {
				const source = usersPath + path + file;
				console.log(source, 'to', destination);
			}
		}
	});

	app.post('/delete', (req, res) => {
		return;
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
				const name = "filebrowser_" + new Date().utcToCurrentTime(time).replace(/ /g, "_").replace(/:/g, "-") + ".zip";
				res.setHeader('Content-Type', 'application/zip');
				res.setHeader('Content-Disposition', `attachment; filename=${name}`);
				res.sendFile(zipFile, { dotfiles: 'allow' });
			});
		}
	});
}
