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

function getSize(directoryPath, callback) {
	function calculateSize(filePath, callback) {
		fs.lstat(filePath, (err, stats) => {
			if (err) return callback(err);

			if (stats.isSymbolicLink()) {
				callback(null, 0);
			} else if (stats.isFile()) {
				callback(null, stats.size);
			} else if (stats.isDirectory()) {
				fs.readdir(filePath, (err, files) => {
					if (err) return callback(err);

					let totalSize = 0;
					async.each(files, (file, acb) => {
						const subPath = path.join(filePath, file);
						calculateSize(subPath, (err, size) => {
							if (err) return acb(err);
							totalSize += size;
							acb();
						});
					}, err => {
						if (err) return callback(err);
						callback(null, totalSize);
					});
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

			fs.lstat(filePath, (err, fileStats) => {
				if (err) return callback(err);

				getSize(filePath, (err, size) => {
					if (err) return callback(err);

					const isDirectory = fileStats.isDirectory();
					const isSymbolicLink = fileStats.isSymbolicLink();
					const fileExtension = (isDirectory ? "Folder" : (isSymbolicLink ? "Symlink" : path.extname(file).replace('.', '')));

					const fileInfo = {
						filename: file,
						modifiedDate: fileStats.mtime,
						creationDate: fileStats.birthtime,
						sizeInBytes: size,
						fileExtension: fileExtension,
						isDirectory: isDirectory,
						isSymbolicLink: isSymbolicLink,
					};

					fileList.push(fileInfo);
					acb();
				});
			});
		}, (err) => {
			callback(err, fileList);
		});
	});
}

function determinePathIfFileExists(dirPath, name, callback, failIfExists = false, postfixNum = 1) {
	const filePath = dirPath + name;

	fs.access(filePath, fs.constants.F_OK, err => { // !err means it exists
		if (failIfExists && !err) {
			callback(dirPath, name, true);
		} else if (!err) {
			const str = name;
			name = postfixNum === 1 ? `${name}-(${postfixNum})` : str.replace(/\(\d\)$/, `(${postfixNum})`);
			determinePathIfFileExists(dirPath, name, callback, failIfExists, postfixNum + 1);
		} else {
			callback(dirPath, name);
		}
	});
}

function getFiles(directoryPath, res) {
	getListOfFiles(directoryPath, (err, fileList) => {
		if (err) return res.end(JSON.stringify({ error: "FROM BACKEND\n" + err.toString() }));
		res.end(JSON.stringify({ success: true, data: fileList }));
	});
}

module.exports = function (router) {
	const basePath = path.resolve(__dirname + "/../../") + "/"; // Turns relative path to absolute path. Express relative path is malicious
	const usersPath = basePath + "users/";

	router.post('/getfiles', (req, res) => {
		const directoryPath = usersPath + req.body.path; // Gets directory of user
		getFiles(directoryPath, res);
	});

	router.post('/shared/:file', (req, res) => {
		const file = req.params.file;
		// redirect to /getfiles with req.body.path `.shared/${file}`
	});

	router.post('/create', (req, res) => {
		const type = req.body.type;
		const isFile = type === "file";
		const name = req.body.name + (isFile ? ".txt" : '');
		const dirPath = usersPath + req.body.path;

		determinePathIfFileExists(dirPath, name, (dirPath, name, exists) => {
			if (exists) {
				res.end(JSON.stringify({ error: "File already exists. Name: " + name }));
				return;
			}

			const cb = (err) => {
				if (err) {
					res.end(JSON.stringify({ error: "FROM BACKEND\n" + err.toString() }));
				} else {
					res.end(JSON.stringify({ success: true, data: name }));
				}
			}

			const filePath = dirPath + name;

			if (isFile) {
				fs.writeFile(filePath, '', cb);
			} else {
				fs.mkdir(filePath, cb);
			}
		}, true); // Fail if it already exists
	});

	router.post('/downloadURL', (req, res) => {
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
					const dirPath = usersPath + req.body.path;

					determinePathIfFileExists(dirPath, name, (dirPath, name) => {
						const filePath = dirPath + name;

						const fws = fs.createWriteStream(filePath);
						response.pipe(fws);

						fws.on('finish', () => {
							res.end(JSON.stringify({ success: true, data: name }));
						});

						fws.on('error', err => onError(err));
					});
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

	router.post('/rename', (req, res) => {
		let count = req.body.count;
		const data = req.body.data;
		const results = { success: {}, error: {} };

		for (const path in data) {
			for (const file in data[path]) {
				const source = usersPath + path + file;
				const name = req.body.name ? req.body.name : file; // renames file to name if it exists
				const dirPath = usersPath + req.body.path;

				determinePathIfFileExists(dirPath, name, (dirPath, name) => {
					const destination = dirPath + name;
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
				});
			}
		}
	});

	router.post('/copy', (req, res) => {
		let count = req.body.count;
		const data = req.body.data;
		const results = { success: {}, error: {} };

		for (const path in data) {
			for (const file in data[path]) {
				const source = usersPath + path + file;
				const dirPath = usersPath + req.body.path;

				determinePathIfFileExists(dirPath, file, (dirPath, name) => {
					const destination = dirPath + name;
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
				});
			}
		}
	});

	router.post('/symlink', (req, res) => {
		let count = req.body.count;
		const data = req.body.data;
		const results = { success: {}, error: {} };

		for (const path in data) {
			for (const file in data[path]) {
				const source = usersPath + path + file;
				const dirPath = usersPath + req.body.path;

				determinePathIfFileExists(dirPath, file, (dirPath, name) => {
					const destination = dirPath + name;
					console.log('Symlink', source, "to", destination);

					fs.symlink(source, destination, err => {
						if (err) {
							results.error[source] = err.toString();
						} else {
							results.success[source] = destination;

							if (--count === 0) {
								res.end(JSON.stringify({ success: true, data: results }));
							}
						}
					});
				});
			}
		}
	});

	router.post('/createLink', (req, res) => {
		let count = req.body.count;
		const data = req.body.data;
		const name = req.body.name;
		const linksPath = usersPath + ".shared/";
		const results = { success: {}, error: {} };

		for (const path in data) {
			for (const file in data[path]) {
				const source = usersPath + path + file;

				determinePathIfFileExists(linksPath, name, (dirPath, name) => {
					const linksPath = dirPath + name + "/";

					fs.mkdir(linksPath, err => {
						determinePathIfFileExists(linksPath, file, (dirPath, name) => {
							const destination = dirPath + name;

							const type = data[path][file] === "Folder" ? "dir" : "file";
							console.log("Create link", "of type:", type, "\n\tfrom:", source, "\n\tto:", destination, "\t|", count);

							fs.symlink(source, destination, type, err => {
								if (err) {
									results.error[source] = err.toString();
								} else {
									results.success[source] = destination;

									if (--count === 0) {
										res.end(JSON.stringify({ success: true, data: results }));
									}
								}
							});
						});
					});
				});
			}
		}
	});

	router.post('/trash', (req, res) => {
		let count = req.body.count;
		const data = req.body.data;
		const results = { success: {}, error: {} };

		const userDir = Object.keys(req.body.data)[0].split('/')[0];
		const trashDir = usersPath + userDir + "/.trash/";

		const date = new Date();
		const timeDir = trashDir + date.localTime(date.getTime(), true) + "/";

		fs.mkdir(trashDir, err => {
			fs.mkdir(timeDir, err => {
				if (err) return res.end(JSON.stringify({ error: "FROM BACKEND\n" + err.toString() }));

				for (const path in data) {
					for (const file in data[path]) {
						const source = usersPath + path + file;

						determinePathIfFileExists(timeDir, file, (dirPath, name) => {
							const destination = dirPath + name;
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
						});
					}
				}
			});
		});
	});

	router.post('/delete', (req, res) => {
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

	router.get('/download*', (req, res) => {
		const type = req.query.type;

		if (type === "file") {
			const filePath = usersPath + decodeURIComponent(req.query.path);
			const filename = filePath.split('/').pop();

			res.setHeader('Content-Type', 'routerlication/force-download');
			res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
			res.sendFile(filePath, { dotfiles: 'allow' });
		} else if (type === "zip") {
			const data = JSON.parse(req.query.data);

			zip.makeZip(data, (zipFile, time) => {
				const name = "filebrowser_" + new Date().localTime(time, true) + ".zip";

				res.setHeader('Content-Type', 'routerlication/zip');
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

	router.post('/upload', upload.array('files[]'), (req, res) => {
		res.end(JSON.stringify({ success: true }));
	});
}
