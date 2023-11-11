const async = require('async');
const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const multer = require('multer');
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
					fileExtension = isDirectory ? "" : path.extname(file).replace('.', '');

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
			const name = "server-download-" + date.localTime(time, true) + fileType;

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
		let count = req.body.count;
		const data = req.body.data;
		const name = req.body.name;
		const results = { success: {}, error: {} };

		for (const path in data) {
			for (const file in data[path]) {
				const source = usersPath + path + file;
				const destination = usersPath + req.body.path + (name ? name : file); // renames file to name if it exists
				console.log('Rename', source, "to", destination);
				fs.rename(source, destination, err => {
					if (err) {
						results.error[source] = err.toString();
					} else {
						results.success[source] = destination;
						if (--count === 0) {
							res.end(JSON.stringify({ success: true, data: results }));
						}
					}
				});
			}
		}
	});

	app.post('/copy', (req, res) => {
		let count = req.body.count;
		const data = req.body.data;
		const results = { success: {}, error: {} };

		for (const path in data) {
			for (const file in data[path]) {
				const source = usersPath + path + file;
				const destination = usersPath + req.body.path + file;
				console.log('Copy', source, "to", destination);
				fs.copy(source, destination, err => {
					if (err) {
						results.error[source] = err.toString();
					} else {
						results.success[source] = destination;
						if (--count === 0) {
							res.end(JSON.stringify({ success: true, data: results }));
						}
					}
				});
			}
		}
	});

	app.post('/trash', (req, res) => {
		let count = req.body.count;
		const data = req.body.data;
		const results = { success: {}, error: {} };

		const date = new Date();
		const timeDir = usersPath + ".trash/" + date.localTime(date.getTime(), true) + "/";
		fs.mkdir(timeDir, err => {
			if (err) return res.end(JSON.stringify({ error: "FROM BACKEND\n" + err.toString() }));

			for (const path in data) {
				for (const file in data[path]) {
					const source = usersPath + path + file;
					const destination = timeDir + file;
					console.log('Trashed', source, "to", destination);
					fs.rename(source, destination, err => {
						if (err) {
							results.error[source] = err.toString();
						} else {
							results.success[source] = destination;
							if (--count === 0) {
								res.end(JSON.stringify({ success: true, data: results }));
							}
						}
					});
				}
			}
		});
	});

	app.post('/delete', (req, res) => {
		let count = req.body.count;
		const data = req.body.data;
		const results = { success: {}, error: {} };

		for (const path in data) {
			for (const file in data[path]) {
				const source = usersPath + path + file;
				fs.remove(source, err => {
					if (err) {
						results.error[source] = err.toString();
					} else {
						results.success[source] = 'deleted';
						if (--count === 0) {
							res.end(JSON.stringify({ success: true, data: results }));
						}
					}
				});
			}
		}
	});

	app.post('/symlink', (req, res) => {
		return;
	});

	app.post('/createLink', (req, res) => {
		let count = req.body.count;
		const data = req.body.data;
		const name = req.body.name;
		const linksPath = usersPath + ".shared/";
		const results = { success: {}, error: {} };

		for (const path in data) {
			for (const file in data[path]) {
				const source = usersPath + path + file;
				const destination = linksPath + name + "/" + file;
				const type = data[path][file] === "Folder" ? "dir" : "file";
				console.log("Create link", "of type:", type, "\n\tfrom:", source, "\n\tto:", destination);
				/*
				fs.symlink(source, destination, type, err => {
					if (err) {
						results.error[source] = err.toString();
					} else {
						*/ 
						results.success[source] = destination;
						if (--count === 0) {
							res.end(JSON.stringify({ success: true, data: results }));
						}
						/*
					}
				});
				*/
			}
		}
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
				const name = "filebrowser_" + new Date().localTime(time, true) + ".zip";

				res.setHeader('Content-Type', 'application/zip');
				res.setHeader('Content-Disposition', `attachment; filename=${name}`);
				res.sendFile(zipFile, { dotfiles: 'allow' });
			});
		}
	});

	const storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, usersPath + req.body.path);
		},
		filename: function (req, file, cb) {
			cb(null, file.originalname);
		}
	});

	const upload = multer({ storage: storage });

	app.post('/upload', upload.array('files[]'), (req, res) => {
		res.end(JSON.stringify({ success: true }));
	});
}
