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

    var jshintMessages = require('jshintMessages');


    var jshintGroomer = (function () {

        /**
        * Used for reporting errors.  The name is shorter to more directly match
        * to the code from jshint
        */
        var helper = {
            e: function(message, token) {
                message.type = "error";
                //console.log("error", message, token);
            },

            /**
            * Used for reporting warnings.  The name is shorter to more directly match
            * to the code from jshint
            */
            w: function(message, token) {
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
            // Make sure the jshintMessage has a valid error code
            jshintMessages.ensureCode(message);

            // Not sure why some characters are at 0...
            if (message.character === 0) {
                message.character = 1;
            }

            var evidence = message.evidence.substr(message.character - 1);
            var index;

            switch (message.code) {
                case "W015": {
                    //evidence = message.evidence.substr(message.b, Math.abs(message.c - message.b) + message.a.length);
                    evidence = message.evidence.substr(message.b);
                    message.character = message.c;
                    break;
                }

                case "W117": {
                    evidence = message.a;
                    break;
                }

                case "W033": {
                    message.character--;
                    evidence = message.evidence.substr(message.character - 1, 1);
                    break;
                }

                case "W040": {
                    index = evidence.search(/[\s;.]/);
                    if ( index !== -1 ) {
                        evidence = evidence.substr(0, index);
                    }
                    break;
                }

                case "W051":{
                    // Find the last occurence of 'delete' starting from where the
                    // error was reported.  Skip six characters because thats how
                    // long 'delete' is; we need the string after delete and before
                    // where the error was reported...
                    var start, end;
                    end = message.character - 1;

                    // Find the first valid charater
                    while (/[\w]/.test(message.evidence[end]) === false) {
                        if( end <= 0) {
                            break;
                        }

                        end--;
                    }

                    // Find the first white space and that should give us our offending
                    // token range.
                    start = end;
                    while (/[\s]/.test(message.evidence[start]) === false) {
                        if( start <= 0) {
                            break;
                        }

                        start--;
                    }

                    // We have to move one up to get to the beginning of the word because the
                    // start marker currently points to the characters that stopped the search
                    start++;
                    end++;

                    evidence = message.evidence.substr(start, end - start);
                    message.character = start + 1;
                    break;
                }

                case "W055": {
                    index = evidence.search(/[(\s;]/);
                    if ( index !== -1 ) {
                        evidence = evidence.substr(0, index);
                    }
                    break;
                }

                case "W086": {
                    if ( settings.laxcasebreak ) {
                        return;
                    }
                    break;
                }

                case "W004":
                case "W098": {
                    message.character -= message.a.length;
                    evidence = message.a;
                    break;
                }

                default: {
                    break;
                }
            }

            var start = {
                line: (message.line - 1),
                ch: (message.character - 1)
            };

            var end = {
                line: (message.line - 1),
                ch: (message.character - 1) + evidence.length
            };

            // For performance reasons, don't figure out the text out
            // of code mirror... I use only for debugging purposes to verify
            // that codemirror is getting the correct piece of data
            //var text = this.cm.getDoc().getRange(start, end);
            var text = evidence;

            var token = {
                text: text,
                start: start,
                end: end
            };

            // Get the handler for the code type
            var helperFunction = message.code[0].toLowerCase();

            if ( helper[helperFunction] ) {
                // Do special handling for the message if a handler exists
                helper[helperFunction](message, token);
            }

            //console.log(token, message);
            return token;
        }


        return {
            groom: groom
        };

    })();


    return jshintGroomer;
});
