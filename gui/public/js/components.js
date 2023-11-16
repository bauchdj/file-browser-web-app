function pathActionBtn(text, title, onclick, first = true) {
	const btn = {
		button: text,
		title: title,
		"class": "btn btn-primary",
		style: {
			margin: "0 0.3rem 0 0",
		},
		onclick: onclick,
	}

	const parent = document.querySelector("body > div > div.files > div > div.flex-r");

	if (first) {
		jsl.dom.add(parent, btn, parent.children[0]);
	} else {
		jsl.dom.add(parent, btn);
	}

	return btn;
}

function clearSelectedBtn(hash) {
	const btn = pathActionBtn("Clear", "Click to clear all selected items", event => {
		btn.el.remove();
		hash.clearSelections();
	}, false);

	return btn.el.onclick;
}

function pathNavBtn(text, callback) {
	//if (selectionHash.clear) {
		selectionHash.clear();
	//}

	const dropdowns = document.querySelector("#dropdowns");
	const displayValue = window.getComputedStyle(dropdowns).getPropertyValue('display');;
	dropdowns.style.display = "none";

	const btn = pathActionBtn(text, "Click to perform file action", event => {
		document.querySelector("#dropdowns").style.display = displayValue;
		btn.el.remove();
		callback(currentPath);
	});
}

function createPopUp(type, options) {
	const divFill = {
		div: '',
		"class": "fill-screen center-y center-x black-transparent",
		onclick: function (event) { this.el.remove(); },
		children: [],
	}

	const divContainer = {
		div: '',
		"class": "popupContainer p-2",
		onclick: event => event.stopPropagation(),
		children: [],
	}

	divFill.children.push(divContainer);

	const isFileGiven = (options.filename !== undefined);
	const headerText = isFileGiven ? options.title + " - " + options.filename : options.title;
	const header = {
		div: headerText,
		"class": "p-1",
		innerHTML: `<b>${headerText}</b>`,
	}

	const body = {
		div: '',
		"class": "p-1",
		children: [],
	}

	if (options.bodyChildren) {
		body.children = options.bodyChildren;
	}

	const footer = {
		div: '',
		"class": "right-x p-1",
		children: [],
	}

	divContainer.children.push(header, body, footer);

	let handleKeyDown;

	function removePopUp() {
		divFill.el.remove();
		if (handleKeyDown) {
			document.removeEventListener('keydown', handleKeyDown);
		}
	}

	function makePrimaryBtn(text = "Ok", callback) {
		handleKeyDown = event => {
			if (event.key === "Enter" || event.keyCode === 13) {
				sharedAction(event);
			}
		}

		const sharedAction = event => {
			if(type !== "input") {
				removePopUp();
			}

			if(callback) {
				callback(event);
			}
		};

		const primaryBtn = {
			button: text,
			"class": "btn btn-primary margin-sides",
			onclick: sharedAction,
			onrender: el => {
				document.addEventListener('keydown', handleKeyDown);
			},
		};

		footer.children.push(primaryBtn);

	}

	function makeSecondaryBtn(text = "Cancel") {
		const secondaryBtn = {
			button: "Cancel",
			"class": "btn btn-secondary",
			onclick: removePopUp,
		}

		footer.children.push(secondaryBtn);
	}

	if (type === "input") {
		const hiddenDiv = {
			div: options.message + "__",
			style: { height: 0, visibility: "hidden" },
			ariaHidden: "true",
		}

		const input = {
			input: '',
			placeholder: options.message,
			style: { width: "100%" },
			onrender: el => el.focus(),
		}

		body.children.push(hiddenDiv, input);

		makeSecondaryBtn();

		makePrimaryBtn(options.title, event => {
			const value = input.el.value;
			const isValueValid = !(value === undefined || value === '');

			if (!isValueValid) {
				jsl.dom.add(header.el, { div: "Nothing entered" });
				return; // Do not remove pop-up if input is invalid
			}

			removePopUp();
			options.callback(value);
		});
	}

	if (type === "options") {
		body.div = options.message;

		makeSecondaryBtn();

		options.btns.primary.forEach(item => {
			makePrimaryBtn(item.text, event => {
				if (item.callback) { 
					item.callback(event);
				}
				if (options.callback) {
					options.callback(event);
				}
			});
		});
	}

	if (type === "message") {
		body.div = options.message;

		if (options.callback) {
			makePrimaryBtn("Ok", event => {
				options.callback(event);
			});
		} else {
			makePrimaryBtn();
		}
	}

	jsl.dom.add(document.body, divFill);
}

