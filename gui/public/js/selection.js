function createSelection(path) {
	const rc = {
		path: path,
		items: {},
	};

	rc.click = el => {
		const filename = el.getAttribute("filename");
		const fileType = el.getAttribute("fileType");
		if (!rc.items[filename]) {
			rc.items[filename] = { filename: filename, fileType: fileType, el: el };
		} else {
			delete rc.items[filename];
		}
	};

	rc.forEach = f => {
		for (const key in rc.items) {
			f(rc.items[key], key);
		}
	};

	rc.clear = () => {
		rc.forEach(item => {
			item.el.checked = false;
		});
		rc.items = {};
	};

	rc.includesFolder = () => {
		let b = false;
		rc.forEach(item => {
			if (!b && item.fileType === 'Folder') {
				b = true;
			}
		});
		return b;
	};

	rc.filenames = () => Object.keys(rc.items);

	rc.includesFile = file => rc.filenames().includes(file);

	rc.files = () => {
		const obj = {};
		rc.forEach((item, filename) => {
			obj[filename] = item.fileType;
		});
		return obj;
	};

	rc.length = () => Object.values(rc.items).length;

	return rc;
}

function selectionClass() {
	const rc = { paths: {}, current: null };

	rc.add = path => {
		if (!rc.paths[path]) {
			rc.paths[path] = createSelection(path);
		}
		rc.current = rc.paths[path];
	};

	rc.clear = () => {
		for (const path in rc.paths) {
			rc.paths[path].clear();
		}
	};

	rc.forEach = f => {
		for (const path in rc.paths) {
			f(rc.paths[path]);
		}
	};

	rc.length = () => {
		let length = 0;
		rc.forEach(selection => {
			length += selection.length();
		});
		return length;
	};

	rc.onlyFiles = () => {
		let b = true;
		rc.forEach(selection => {
			if (b && selection.includesFolder()) {
				b = false;
			}
		});
		return b;
	};
	
	rc.getPaths = () => Object.keys(rc.paths);

	rc.filenames = () => {
		let files = [];
		rc.forEach(selection => {
			files = files.concat(selection.filenames());
		});
		return files;
	};

	rc.files = () => {
		let obj = {};
		rc.forEach(selection => {
			obj[selection.path] = selection.files();
		});
		return obj;
	};

	rc.first = () => {
		const obj = {};
		obj.path = Object.keys(rc.paths)[0];
		const files = rc.files();
		obj.filename = Object.keys(files[obj.path])[0];
		obj.fileType = files[obj.path][obj.filename];
		return obj;
	};

	return rc;
};
