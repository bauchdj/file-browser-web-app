function pathActionBtn(text, title) {
	const btn = {
		button: text,
		title: title,
		"class": "btn btn-primary",
		style: {
			margin: "0 0.3rem 0 0",
		},
	}
	return btn;
}

function clearSelectedBtn(hash) {
	if (document.querySelector("#dropdowns").style.display === "none") return;
	const btn = pathActionBtn("Clear", "Click to clear all selected items");
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
	const btn = pathActionBtn(text);
	btn.onclick = event => {
		document.querySelector("#dropdowns").style.display = displayValue;
		btn.el.remove();
		callback(currentPath);
	};
	dropdowns.style.display = "none";
	const parent = document.querySelector("body > div > div.files > div > div.flex-r");
	jsl.dom.add(parent, btn, parent.children[0]);
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
	const isFileGiven = (options.file !== undefined);
	const headerText = isFileGiven ? options.title + " - " + options.file : options.title;
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
	const footer = {
		div: '',
		"class": "right-x p-1",
		children: [],
	}
	divContainer.children.push(header, body, footer);

	function makePrimaryBtn(text = "Ok", callback) {
		const primaryBtn = {
			button: text,
			"class": "btn btn-primary margin-sides",
			onclick: event => { // default to removing pop up
				if(type !== "input") divFill.el.remove();
				if(callback) callback(event);
			},
		}
		footer.children.push(primaryBtn);
	}

	function makeSecondaryBtn(text = "Cancel") {
		const secondaryBtn = {
			button: "Cancel",
			"class": "btn btn-secondary",
			onclick: () => divFill.el.remove(),
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
		}

		body.children.push(hiddenDiv, input);

		makeSecondaryBtn();
		makePrimaryBtn(options.title, event => {
			const value = input.el.value;
			const noValue = (value === undefined || value === '');
			if (!noValue) {
				divFill.el.remove();
				options.callback(value);
				return;
			}
			jsl.dom.add(header.el, { div: "Nothing entered" });
		});
	}
	if (type === "options") {
		body.div = options.message;
		makeSecondaryBtn();
		options.btns.primary.forEach(item => {
			makePrimaryBtn(item.text, event => {
				item.callback(event);
				options.callback(event);
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

