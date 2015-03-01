var columns = [$('#col1'), $('#col2'), $('#col3')],
	categories = $('#categories'),
	numCards = 0,
	bookmarkURL = $('#new-url'),
	saveModal = $('#save-bookmark'),
	saveModalContainer = $('#modal-add'),
	saveModalProgress = saveModalContainer.find('.progress'),
	urlRegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.!\/\\\w]*))?)/g;

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
		if (!input.match(/http:\/\//)) {
			input = 'http://' + input;
		}
		addCard('TEST!!!', undefined, input);
		bookmarkURL.val('');
		$('#modal-add').closeModal();
	}
});
$('div a.btn-floating').click(function() {
	saveModalContainer.openModal();
	saveModalProgress.removeClass('active');
	saveModal.addClass('disabled');
});
$('#add-form').submit(function() {
	saveModal.click();
	event.preventDefault();
});
