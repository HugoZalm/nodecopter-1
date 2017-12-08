(function (window, document, $, undefined) {
    'use strict';

    var Buttonbar = function (cockpit) {
        console.log("Adding Buttonbar to screen.");
        
        // add buttonbarr under heading-container
        $("div.header-container").after("<div class='buttonbar'></div>");
        var buttoncontainer = $("div.buttonbar");
        
        // lower main-container
        var maincontainer = $("div.main-container");
        maincontainer.css('top', ( parseFloat(maincontainer.css('top')) + parseFloat(buttoncontainer.css('height')) + 10 ) + 'px');
 
        // add test-buttons
        var button = "<div class='button'>Test</div>"
        buttoncontainer.html(button);
        
    };
    window.Cockpit.plugins.push(Buttonbar);

}(window, document, jQuery));