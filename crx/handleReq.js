$("#save").click(function() {
	chrome.tabs.executeScript({"file":"patch-worker.js"});
	chrome.tabs.executeScript({"file":"content.js"});
})
