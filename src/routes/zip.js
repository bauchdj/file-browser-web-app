const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const basePath = path.resolve(__dirname + "/../../") + "/"; // Turns relative path to absolute path. Express relative path is malicious
const usersPath = basePath + "users/";

exports.makeZip = function (data, callback) {
	const time = new Date().getTime();
	const filePath = "/tmp/filebrowser_" + time + ".zip";
	const fws = fs.createWriteStream(filePath);
	const archive = archiver('zip', { zlib: { level: 9 } });
	archive.pipe(fws);
	for (const path in data) {
		for (const file in data[path]) {
			const filePath = usersPath + path + file;
			if (data[path][file] === "Folder") {
				archive.directory(filePath, file);	
			} else {
				archive.file(filePath, { name: file });
			}
		}
	}

	archive.finalize();

	fws.on('close', () => {
		callback(filePath, time);
	});
}

