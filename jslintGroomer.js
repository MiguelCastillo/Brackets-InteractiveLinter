/*
 * Copyright (c) 2013 Miguel Castillo.
 *
 * Licensed under MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

/*jslint plusplus: true, nomen: true, regexp: true, maxerr: 50 */

define(function (require, exports, module) {
    'use strict';

    var JSLintError = require('JSLintError');

    var jslintGroomer = (function () {

        /**
        * Used for reporting errors.  The name is shorter to more directly match
        * to the code from jshint
        */
        var helper = {
            e: function(message, token) {
                message.etype = message.type;
                message.type = "error";
                //console.log("error", message, token);
            },

            /**
            * Used for reporting warnings.  The name is shorter to more directly match
            * to the code from jshint
            */
            w: function(message, token) {
                message.etype = message.type;
                message.type = "warning";
                //console.log("warning", message, token);
            }
        };


        /**
        * Breaks up the message from jshint into something that can be used
        * by codemirror.
        *
        * @param message {Object} jshint message
        * @param settings {Object} jshint settings
        */
        function groom(message, settings) {
            var token = new JSLintError(message, settings);

            if (!message.code) {
                message.code = "W000";
            }

            // Get the handler for the code type
            var helperFunction = message.code[0].toLowerCase();

            if ( helper[helperFunction] ) {
                // Do special handling for the message if a handler exists
                helper[helperFunction](message, token);
            }

            return {
                text: token.evidence,
                start: token.startPosition,
                end: token.endPosition
            };
        }


        return {
            groom: groom
        };

    })();


    return jslintGroomer;
});
