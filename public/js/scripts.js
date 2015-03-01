var columns = [$('#col1'), $('#col2'), $('#col3')],
	categories = $('#categories'),
	numCards = 0;
var addCard = function(title, image, link) {
	var img = '<img src=\'' + image + '\'/>';
	if (image === undefined) {
		img = '<div class="bookmark-icon"><i class="mdi-action-bookmark-outline"></i></div>'
	}
	columns[numCards % 3].append('<a href=\'' + link + '\'><div class=\'card small\'>' +
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
var addCategory = function(title) {
	categories.append('<li><a href=\'#\'>' + title + '</a></li>');
	categories.children().last().click(function() {
		toast($(this).text());
	})
};
$('#save-bookmark').click(function() {
	var input = $('#new-url');
	addCard('TEST!!!', undefined, input.val());
	input.val('');
	$('#modal-add').closeModal();
});
