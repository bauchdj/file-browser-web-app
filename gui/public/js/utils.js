Date.prototype.toTimestamp = function() {
	let d = this;
	let y = d.getFullYear();
	if( isNaN( y ) ) {
		return '';
	}
	let rc = "" + y + "-";
	let m = (d.getMonth() + 1);
	if( m < 10 ) {
		m = "0" + m;
	}
	rc += m + "-";
	let day = d.getDate();
	if( day < 10 ) {
		day = "0" + day;
	}
	rc += day + " ";
	m = d.getHours();
	if( m < 10 ) {
		m = "0" + m;
	}
	rc += m + ":";
	m = d.getMinutes();
	if( m < 10 ) {
		m = "0" + m;
	}
	rc += m + ":";
	m = d.getSeconds();
	if( m < 10 ) {
		m = "0" + m;
	}
	rc += m;
	return rc;
};

Date.prototype.localTime = function () {
	try {
		let d = this;
		let td = new Date( d.getTime() - (d.getTimezoneOffset() * 60 * 1000) );
		return td.toISOString();
	}
	catch (pe) {
		console.log('error', pe);
		return "";
	}
};

Date.prototype.utcToCurrentTime = function (utcTimeString) {
	const utcDate = new Date(utcTimeString);
	const localDate = new Date(utcDate.localTime());
	const formattedLocalTime = localDate.toTimestamp();
	return formattedLocalTime;
}

