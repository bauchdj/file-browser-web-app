Date.prototype.localTime = function(utcTimeString, fileFormat) {
	try {
		const date = new Date(utcTimeString);

		const options = {
			year: "numeric",
			month: "numeric",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
			hour12: false,
		};

		const dateFormat = new Intl.DateTimeFormat("en-US", options).format(date).replace(',', '');

		const time = fileFormat ? dateFormat.replace(/[#$%&*?$!@+|=:\s<>{}\/\\`'"]/g, "-") : dateFormat;

		return time
	}
	catch (pe) {
		console.log('error', pe);
		return "";
	}
};

