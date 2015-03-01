$('.button-collapse').sideNav();
$('div a.btn-floating').click(function() {
	$('#modal-add').openModal();
});
$('#settings').click(function() {
	$('#modal-settings').openModal();
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