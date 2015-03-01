var columns = [$('#col1'), $('#col2'), $('#col3')];
var numCards = 0;
var newCard = function(title, image) {
	columns[numCards % 3].append('<div class=\'card small\'>' +
	'<div class=\'card-image fill-card\'>' +
	'<img src=\'' + image + '\'/>' +
	'<span class=\'card-title\'>' + title + '</span>' +
	'</div>' +
	'</div>');
	numCards++;
};