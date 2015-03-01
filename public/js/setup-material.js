$('.button-collapse').sideNav();
$('div a.btn-floating').click(function() {
	toast('hey!', 1000);
});
$('div.card.small').click(function() {
	toast('yo', 400);
});
$('#settings').click(function() {
	$('#modal-settings').openModal();
});
$('.card').scrollfire({
	onBottomIn: function(elm) {
		$(elm).addClass('active');
	}
}).scrollfire({
	onBottomHidden: function(elm) {
		$(elm).removeClass('active');
	}
});