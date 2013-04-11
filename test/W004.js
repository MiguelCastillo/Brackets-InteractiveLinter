/* This error only happens in strict mode */

define(function() {
    'use strict';

    var index = 0;
    var message = "First definition",   message    = "Second definition";

    while(index++ < 100) {
        var    message       = "Third definition";
        console.log(message);
    }


    for (var index in message) {
        index++;
        var message = message + index;
    }

});
