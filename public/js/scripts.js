var columns = [$('#col1'), $('#col2'), $('#col3')],
	categories = $('#categories'),
	numCards = 0,
	bookmarkURL = $('#new-url'),
	saveModal = $('#save-bookmark'),
	saveModalContainer = $('#modal-add'),
	saveModalProgress = saveModalContainer.find('.progress'),
	importModal = $('#modal-import'),
	tabs = $('.tabs'),
	datePicker = $('.datepicker'),
	urlRegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.!\/\\\w]*))?)/g,

	settingAutomatic = $('#automatic-quantity'),
	settingAlgorithm = $('#sorting-algorithm'),
	settingNumber = $('#folder-quantity');

var addCard = function(title, image, link) {
	var img = '<img src=\'' + image + '\'/>';
	if (image === undefined) {
		img = '<div class="bookmark-icon"><i class="mdi-action-bookmark-outline"></i></div>';
	}
	columns[numCards % 3].append('<a href=\'' + link + '\' target=\'_blank\'><div class=\'card small\'>' +
	'<div class=\'card-image fill-card\'>' +
	img +
	'<span class=\'card-title\'>' + title + '</span>' +
	'</div>' +
	'</div></a>');
	var card = columns[numCards % 3].children().last().children();
	card.scrollfire({
		onBottomIn: function(elm) {
			$(elm).addClass('active');
		}
	}).scrollfire({
		onBottomHidden: function(elm) {
			$(elm).removeClass('active');
		}
	});
	// If card is in view
	var win = $(window);
	if (win.scrollTop() + win.height() >= card.offset().top) {
		card.addClass('active');
	}
	numCards++;
};
// Display a category of cards
var addCards = function(lst) {
	lst.forEach(function(website) {
		// Title, image URL, and page URL
		addCard(website[0], website[1], website[2]);
	});
};
var addCategory = function(title,pop) {
	$("#"+pop).append('<li><a class=\''+pop+'\' type=\''+title+'\' href=\'#'+title+'\'>' + title + '</a></li>');
	/*categories.children().last().click(function() {
	 toast($(this).text());
	 });*/
};
var removeCards = function() {
	numCards = 0;
	columns.forEach(function (column) {
		column.empty();
	});
};
var validateURL = function() {
	if (!saveModalProgress.hasClass('active') && bookmarkURL.val().match(urlRegEx)) {
		saveModal.removeClass('disabled');
	} else {
		saveModal.addClass('disabled');
	}
};
bookmarkURL[0].oninput = validateURL;
saveModal.click(function() {
	if (!saveModal.hasClass('disabled')) {
		saveModal.addClass('disabled');
		saveModalProgress.addClass('active');
		var input = bookmarkURL.val();
		if (!input.match(/http:\/\//) && !input.match(/https:\/\//)) {
			input = 'http://' + input;
		}
		var xhr = new XMLHttpRequest();
		console.log(input);
		xhr.open("GET",input);
		xhr.onerror = function(e) {console.log(e)};
		xhr.onload = function() {
			var worker = new Worker(chrome.runtime.getURL('crx/worker.js'));
			var type = "s"; //allows for other types
			var title = xhr.response.match(/<title>(.+)<\/title>/);
			worker.postMessage(JSON.stringify([xhr.response.split("<body")[1].split("</body")[0].replace(/<[^>]*>/g, "").match(/\w+/g).join(" "),title ? title[1] : input,1.1]));
			worker.onmessage = function(event) {
				console.log(event.data);
				var bms = chrome.storage.sync.get("pages",function(val) {
					var pages = [];
					if (val.pages) {
						pages = val.pages
					}
					console.log(pages);
					var loc = input.split("://")[1].split("#")[0];
					if (pages.indexOf(loc) < 0) {
						pages.push(loc);
						console.log(chrome.storage.sync.set({"pages": pages}));
						var a = {},
							arr = JSON.parse(event.data),
							dom = location.origin.split("://")[1].split("."),
							d = new Date();
						arr.push(dom[dom.length-2]+":30.0");
						a[loc] = [arr,title ? title[1] : input ,type,(d.getMonth()+1)+"/"+(d.getDay()+1)+"/"+(d.getYear()-100)]
						chrome.storage.sync.set(a);
						/*createSnackbar("Page Saved","View Bookmarks", function() {
						 chrome.runtime.sendMessage({greeting: "bookmarks"})
						 });*/
					} else {
						/*createSnackbar("Page Already Saved","View Bookmarks", function() {
						 chrome.runtime.sendMessage({greeting: "bookmarks"})
						 });*/
					}
				})
			};
		};
		xhr.send();
		addCard(input, undefined, input);
		bookmarkURL.val('');
		$('#modal-add').closeModal();
	}
});
$('.fixed-action-btn').find('a.btn-floating').click(function() {
	saveModalContainer.openModal();
	saveModalProgress.removeClass('active');
	saveModal.addClass('disabled');
});
$('#add-form').submit(function() {
	saveModal.click();
	event.preventDefault();
});
datePicker.pickadate({
	selectMonths: true, // Creates a dropdown to control month
	selectYears: 15 // Creates a dropdown of 15 years to control year
});
tabs.children().eq(1).click(function() {
	if (tabs.children().eq(1).find('a').hasClass('active')) {
		datePicker.click();
		return false;
	}
});
$(document).delegate('#save-settings', 'click', function() {
	console.log(settingNumber.val());
	if (settingAutomatic.is(':checked')) {
		localStorage.removeItem('num');
	} else {
		localStorage.setItem('num', settingNumber.val());
	}
});
$(document).delegate('#import-yes', 'click', function() {
	importModal.find('.modal-content').html('<h4>Importing Bookmarks</h4>');
	importModal.find('.progress').addClass('active');
	$('#import-yes').addClass('disabled');
	// Insert import code here
});
settingAutomatic.change(function() {
	if(settingAutomatic.is(':checked')) {
		settingNumber.prop('disabled', true);
		settingAlgorithm.prop('disabled', true);
	} else {
		settingNumber.prop('disabled', false);
		settingAlgorithm.prop('disabled', false);
	}
});
$(document).ready(function() {
	settingAlgorithm.material_select();
});
//datePicker[0].oninput = sortyByDate(datePicker.val());
if (localStorage.getItem('run-once') === null) {
	importModal.openModal();
	localStorage.setItem('run-once', true);
}