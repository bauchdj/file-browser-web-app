function createSelection(path) {
	const rc = {
		path: path,
		items: {},
		allSelected: false,
		nextIndex: 0,
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

	rc.files = () => {
		const obj = {};
		rc.forEach((item, filename) => {
			obj[filename] = item.fileType;
		});
		return obj;
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

	rc.length = () => Object.values(rc.items).length;

	rc.isEmpty = () => rc.length() === 0;

	rc.next = () => {
		if (rc.nextIndex == rc.length()) {
			rc.nextIndex = 0;
			return;
		};
		const i = rc.nextIndex;
		const name = rc.filenames()[i];
		const file = rc.items[name];
		rc.nextIndex++;
		return name
	};

	return rc;
}

function selectionClass() {
	const rc = {
		paths: {}, 
		current: null,
		nextIndex: 0,
	};

	rc.add = path => {
		if (!rc.paths[path]) {
			rc.paths[path] = createSelection(path);
		}
		if (rc.current && rc.current.isEmpty()) {
			delete rc.paths[rc.current.path];
		}
		rc.current = rc.paths[path];
	};

	rc.clear = () => {
		for (const path in rc.paths) {
			rc.current.clear();
			if (rc.paths[path] != rc.current) {
				delete rc.paths[path];
			}
		}
	};

	rc.forEach = f => {
		for (const path in rc.paths) {
			f(rc.paths[path]);
		}
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

	rc.length = () => {
		let length = 0;
		rc.forEach(selection => {
			length += selection.length();
		});
		return length;
	};

	rc.isEmpty = () => rc.length() === 0;

	rc.isSingle = () => rc.length() === 1;

	rc.isMultiple = () => rc.length() > 1;

	rc.getPaths = () => Object.keys(rc.paths);

	rc.next = () => {
		if (rc.nextIndex === rc.getPaths().length) {
			rc.nextIndex = 0;
			return rc.next();
		};
		const i = rc.nextIndex;
		const path = rc.getPaths()[i];
		const file = rc.paths[path].next();
		if (!file) {
			rc.nextIndex++;
			return rc.next();
		}
		return path + file;
	};

	return rc;
};
