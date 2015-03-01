var searchIcon = $('#search'),
	searchTerm = $('#search-term');

$('.button-collapse').sideNav();
$('#settings').click(function() {
	$('#modal-settings').openModal();
});
searchTerm.change(function() {
	//filter cards
});
searchIcon.children().first().click(function() {
	if (searchIcon.hasClass('active')) {
		searchTerm.blur();
		setTimeout(function() {
			searchIcon.removeClass('active');
		}, 100);
		setTimeout(function() {
			searchTerm.val('');
		}, 500);
	} else {
		searchIcon.addClass('active');
		setTimeout(function() {
			searchTerm.focus();
		}, 300);
	}
});
// May be deleted
$('.card').scrollfire({
	onBottomIn: function(elm) {
		$(elm).addClass('active');
	}
}).scrollfire({
	onBottomHidden: function(elm) {
		$(elm).removeClass('active');
	}
});