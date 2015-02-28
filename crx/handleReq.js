chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.insertCSS({"file":"crx/snack.css"})
	chrome.tabs.insertCSS({"file":"crx/fonts.css"})
	chrome.tabs.executeScript({"file":"crx/patch-worker.js"});
	chrome.tabs.executeScript({"file":"crx/content.js"});
})
