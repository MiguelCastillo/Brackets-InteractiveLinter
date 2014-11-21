/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    "use strict";

    /**
     * Breaks up the message from jshint into something that can be used
     * by codemirror.
     *
     * @param message {Object} jshint message
     */
    function groom(message) {
        message.reason = "Expected: " + message.expected.join(', ') + ". Instead saw: " + message.text + ".";
        message.type = "error";

        return {
            text: message.text,
            start: {
                line: (message.loc.first_line - 1),
                ch: message.loc.first_column
            },
            end: {
                line: (message.loc.last_line - 1),
                ch: message.loc.last_column
            }
        };
    }


    return {
        groom: groom
    };

});
