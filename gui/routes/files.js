const fs = require('fs')
const path = require('path');
const async = require('async');
const archiver = require('archiver');

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
	const basePath = path.resolve(__dirname + "/../../users") + "/"; // Turns relative path to absolute path. Express relative path is malicious

	app.post('/files', (req, res) => {
		const directoryPath = basePath + req.body.user + "/"; // Gets directory my user
		
		getListOfFiles(directoryPath, (err, fileList) => {
			if (err) res.end(JSON.stringify({ error: "FROM BACKEND\n" + err.toString() }));
			res.end(JSON.stringify(fileList));
		});
	});
	
	app.get('/download*', (req, res) => {
		const type = req.query.type;
		const filePath = basePath + decodeURIComponent(req.query.path);

		if (type === "file") {
			const filename = filePath.split('/').pop();
			res.setHeader('Content-Type', 'application/force-download');
			res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
			res.sendFile(filePath, { dotfiles: 'allow' });
		} else if (type === "zip") {
			const filePath = '';
			const output = fs.createWriteStream(filePath);
			const archive = archiver('zip', { zlib: { level: 9 } });
			archive.pipe(output);
			// For each file add it to archive
				archive.file('filePath/to/file1.txt', { name: 'file1.txt' });
			archive.finalize();

			output.on('close', () => {
				res.setHeader('Content-Type', 'application/zip');
				res.setHeader('Content-Disposition', `attachment; filename=download.zip`);
				res.sendFile(filePath, { dotfiles: 'allow' });
			});
		}
	});
}
