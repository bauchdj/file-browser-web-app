function pathMenuBtn(text) {
	const btn = { 
		button: text,
		"class": "btn btn-primary",
		style: {
			margin: "0 0.3rem 0 0",
		},
	}
	return btn
}

function clearSelectedBtn(text, hash) {
	if (document.querySelector("#dropdowns").style.display === "none") return;
	const btn = pathMenuBtn(text);
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

