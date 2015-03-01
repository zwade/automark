var worker = new Worker(chrome.runtime.getURL('crx/worker.js'));
var type = "s" //allows for other types
worker.postMessage(document.body.innerText);
worker.onmessage = function(event) {
	console.log(event.data);
	var bms = chrome.storage.sync.get("pages",function(val) {
		var pages = []
		if (val.pages) {
			pages = val.pages
		}
		console.log(pages)
		var loc = location.href.split("://")[1].split("#")[0].split("?")[0];
		if (pages.indexOf(loc) < 0) {
			pages.push(loc)
			console.log(chrome.storage.sync.set({"pages": pages}));
			chrome.runtime.sendMessage({greeting:"takePic"});
			var a = {}
			a[loc] = [JSON.parse(event.data),document.title,type]
			console.log(chrome.storage.sync.set(a));
			createSnackbar("Page Saved","View Bookmarks", function() {
				chrome.runtime.sendMessage({greeting: "bookmarks"})
			});
		} else {
			createSnackbar("Page Already Saved","View Bookmarks", function() {
				chrome.runtime.sendMessage({greeting: "bookmarks"})
			});
		}
	})
};

spawnLightbox = function() {

}

/* This is a prototype */
var createSnackbar = (function() {
	// Any snackbar that is already shown
	var previous = null;
	
/*
<div class="paper-snackbar">
	<button class="action">Dismiss</button>
	This is a longer message that won't fit on one line. It is, inevitably, quite a boring thing. Hopefully it is still useful.
</div>
*/
	
	return function(message, actionText, action) {
		if (previous) {
			previous.dismiss();
		}
		var snackbar = document.createElement('div');
		snackbar.className = 'paper-snackbar';
		snackbar.dismiss = function() {
			this.style.opacity = 0;
		};
		var text = document.createTextNode(message);
		snackbar.appendChild(text);
		if (actionText) {
			if (!action) {
				action = snackbar.dismiss.bind(snackbar);
			}
			var actionButton = document.createElement('button');
			actionButton.className = 'action';
			actionButton.innerHTML = actionText;
			actionButton.addEventListener('click', action);
			snackbar.appendChild(actionButton);
		}
		setTimeout(function() {
			if (previous === this) {
				previous.dismiss();
			}
		}.bind(snackbar), 5000);
		
		snackbar.addEventListener('transitionend', function(event, elapsed) {
			if (event.propertyName === 'opacity' && this.style.opacity == 0) {
				this.parentElement.removeChild(this);
				if (previous === this) {
					previous = null;
				}
			}
		}.bind(snackbar));

		
		
		previous = snackbar;
		document.body.appendChild(snackbar);
		// In order for the animations to trigger, I have to force the original style to be computed, and then change it.
		getComputedStyle(snackbar).bottom;
		snackbar.style.bottom = '0px';
		snackbar.style.opacity = 1;
	};
})();

