var worker = new Worker(chrome.runtime.getURL('worker.js'));
worker.postMessage(document.body.innerText);
worker.onmessage = function(event) {
	console.log(event.data);
};
