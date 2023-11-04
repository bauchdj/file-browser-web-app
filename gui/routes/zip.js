const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const basePath = path.resolve(__dirname + "/../../") + "/"; // Turns relative path to absolute path. Express relative path is malicious
const usersPath = basePath + "users/";

exports.makeZip = function (data, callback) {
	const time = new Date().getTime();
	const filePath = "/tmp/filebrowser_" + time + ".zip";
	const output = fs.createWriteStream(filePath);
	const archive = archiver('zip', { zlib: { level: 9 } });
	archive.pipe(output);
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

	output.on('close', () => {
		callback(filePath, time);
	});
}

