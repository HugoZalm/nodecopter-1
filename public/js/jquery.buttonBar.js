(function ($) {

    $.buttonBar = function (options) {

        settings = $.extend({
            html           : 'Your message here',
            cssClass       : '',
            position       : 'top'
        }, options);

        bar = $("<div></div>")
               .addClass("jquery-notify-bar")
               .addClass(settings.cssClass)
               .attr("id", "__buttonBar");
        text_wrapper = $("<span></span>")
                            .addClass("notify-bar-text-wrapper")
                            .html(settings.html);

        bar.html(text_wrapper);

        if (bar !== 'object') {
            $("body").prepend(bar);
        }
        
            
        
            
    };
})(jQuery);