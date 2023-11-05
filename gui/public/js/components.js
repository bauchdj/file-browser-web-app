function pathMenuBtn(text, title) {
	const btn = { 
		button: text,
		title: title,
		"class": "btn btn-primary",
		style: {
			margin: "0 0.3rem 0 0",
		},
	}
	return btn
}

function clearSelectedBtn(hash) {
	if (document.querySelector("#dropdowns").style.display === "none") return;
	const btn = pathMenuBtn("Clear", "Click to clear all selected items");
	btn.onclick = event => {
		btn.el.remove();
		hash.clear();
	};
	const parent = document.querySelector("body > div > div.files > div > div.flex-r");
	jsl.dom.add(parent, btn, parent.children[0]);
	return btn.onclick;
}

function pathNavBtn(text, hash, callback) {
	hash.current.onLastClick();
	const dropdowns = document.querySelector("#dropdowns");
	const displayValue = window.getComputedStyle(dropdowns).getPropertyValue('display');;
	const btn = pathMenuBtn(text);
	btn.onclick = event => {
		document.querySelector("#dropdowns").style.display = displayValue;
		btn.el.remove();
		callback(currentPath);
	};
	dropdowns.style.display = "none";
	const parent = document.querySelector("body > div > div.files > div > div.flex-r");
	jsl.dom.add(parent, btn, parent.children[0]);
}

function selectAll(el) {
    const checkboxes = Array.from(document.querySelectorAll('.checkbox'));
    checkboxes.forEach(checkboxEl => {
        selectionHash.current.allSelected = el.checked;
        if (checkboxEl.checked != el.checked) {
            checkboxEl.checked = el.checked;
            selectionHash.current.click(checkboxEl);
        }
    });
}

function createPopUp(type, options) {
	const divFillScreenBackground = document.createElement("div");
	divFillScreenBackground.className = "fill-screen center-y center-x black-transparent";
	const divContainer = document.createElement("div");
	divFillScreenBackground.onclick = function (event) { this.remove(); };
	divContainer.className = "popupContainer p-2";
	divContainer.onclick = event => { event.stopPropagation(); };
	const header = document.createElement("div");
	const isFileGiven = (options.file !== undefined);
	const headerText = isFileGiven ? options.title + " - " + options.file : options.title;
	header.innerHTML = `<b>${headerText}</b>`;
	header.className = "p-1";
	const body = document.createElement("div");
	body.className = "p-1";
	const footer = document.createElement("div");
	footer.className = "right-x p-1";

	function makePrimaryBtn(text = "Ok", callback) {
		const primaryBtn = document.createElement("button");
		primaryBtn.className = "btn btn-primary margin-sides";
		primaryBtn.textContent = text;
		primaryBtn.onclick = event => { // default to removing pop up
			callback ? callback(event) : divFillScreenBackground.remove();
		};
		footer.appendChild(primaryBtn);
		return primaryBtn;
	}

	function makeSecondaryBtn(text = "Cancel") {
		const secondaryBtn = document.createElement("button");
		secondaryBtn.className = "btn btn-secondary";
		secondaryBtn.textContent = "Cancel";
		secondaryBtn.onclick = () => divFillScreenBackground.remove();
		footer.appendChild(secondaryBtn);
		return secondaryBtn;
	}

	if (type === "input") {
		const hiddenDiv = document.createElement("div");
		hiddenDiv.style = "height: 0; visibility: hidden;"
		hiddenDiv.ariaHidden = "true";
		hiddenDiv.textContent = options.message + "__";
		const input = document.createElement("input");
		input.placeholder = options.message;
		input.style = "width: 100%;";
		body.appendChild(hiddenDiv);
		body.appendChild(input);

		makeSecondaryBtn();
		makePrimaryBtn(options.title, event => {
			const value = input.value;
			const isValue = (value === undefined || value === '');
			const isFilename = options.inputType === "filename";
			const fileExist = (isFilename && filesHash[value] !== undefined);
			if (!isValue && !fileExist) {
				divFillScreenBackground.remove();
				options.callback(value);
				return;
			}
			const div = document.createElement('div');
			const text = fileExist ? "Name already exists" : "No name entered";
			div.textContent = text;
			header.appendChild(div);
		});
	}
	if (type === "options") {
		body.textContent = options.message;
		makeSecondaryBtn();
		options.btns.primary.forEach(item => {
			makePrimaryBtn(item.text, event => {
				divFillScreenBackground.remove();
				item.callback(event);
				options.callback(event);
			});
		});
	}
	if (type === "message") {
		body.textContent = options.message;
		if (options.callback) {
			makePrimaryBtn("Ok", event => {
				divFillScreenBackground.remove();
				options.callback(event);
			});
		} else {
			makePrimaryBtn();
		}
	}

	divContainer.appendChild(header);
	divContainer.appendChild(body);
	divContainer.appendChild(footer);
	divFillScreenBackground.appendChild(divContainer);
	document.body.appendChild(divFillScreenBackground);
}

