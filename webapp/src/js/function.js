function xhrSuccess() {
	this.callback.apply(this, this.arguments);
}

function xhrError() {
	console.error(this.statusText);
}

function loadFile(sURL, fCallback) {
	var oReq = new XMLHttpRequest();
	oReq.callback = fCallback;
	oReq.arguments = Array.prototype.slice.call(arguments, 2);
	oReq.onload = xhrSuccess;
	oReq.onerror = xhrError;
	oReq.open("get", sURL, true);
	oReq.send(null);
}

module.exports.loadFile = loadFile;
