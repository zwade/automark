chrome.bookmarks.onCreated.addListener(function(tab) {
	chrome.tabs.insertCSS({"file":"crx/snack.css"})
	chrome.tabs.insertCSS({"file":"crx/fonts.css"})
	chrome.tabs.executeScript({"file":"crx/patch-worker.js"});
	chrome.tabs.executeScript({"file":"crx/content.js"});
})
chrome.runtime.onMessage.addListener(function(req, sender, res) {
	if (req.greeting == "bookmarks") {
		chrome.tabs.create({"url":"chrome://bookmarks"});
	} else if (req.greeting == "takePic") {
		chrome.tabs.captureVisibleTab({quality:1},function(img) {
			console.log(img.length);
			var a = {}
			var loc = sender.tab.url.split("://")[1].split("#")[0]
			console.log(loc);
			a[loc] = img
			chrome.storage.local.set(a);
		})
	} else {
		console.log(req.greeting);
	}
})
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({"url":"chrome://bookmarks"});
	
})
