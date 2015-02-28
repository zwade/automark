onmessage = function(e) {
	words = e.data.match(/\w+/g);
	postMessage(JSON.stringify(["hello","world","this","is","keywords"]));
}
