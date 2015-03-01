(function($) {

  // Input: Array of JSON objects {selector, offset, callback}

  scrollFire = function(options) {
    $(window).scroll(function () {
      var windowScroll = $(window).scrollTop() + $(window).height();

      $.each(options, function( i, value ){
        var selector = value.selector,
            offset = value.offset,
            callback = value.callback;

        var element = $(selector),
	        elementOffset = element.offset().top;

        if (windowScroll > (elementOffset + offset)) {
          if (value.done != true) {
            callback(element);
            value.done = true;
          }
        }
      });
    });
  }

})(jQuery);