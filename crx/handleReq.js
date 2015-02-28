chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.insertCSS({"file":"snack.css"})
	chrome.tabs.insertCSS({"file":"fonts.css"})
	chrome.tabs.executeScript({"file":"patch-worker.js"});
	chrome.tabs.executeScript({"file":"content.js"});
})
