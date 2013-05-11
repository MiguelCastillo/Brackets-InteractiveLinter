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



        function processMessage(message, settings) {
            // Not sure why some characters are at 0...
            if (message.character === 0) {
                message.character = 1;
            }

            var evidence = message.evidence.substr(message.character - 1);
            var index, start, end;

            switch (message.code) {
                case "W032": {
                    evidence = ";";
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

                case "W041": {
                    evidence = message.a;
                    break;
                }

                case "W051": {
                    // Find the last occurence of 'delete' starting from where the
                    // error was reported.  Skip six characters because thats how
                    // long 'delete' is; we need the string after delete and before
                    // where the error was reported...
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
                        return false;
                    }
                    break;
                }

                /*
                case "W004":
                case "W015":
                case "W098":
                case "W117": {
                    start = message.evidence.lastIndexOf(message.a, message.character);
                    message.character = start + 1;
                    evidence = message.a;

                    break;
                }
                */

                default: {
                    if ( message.a ) {
                        start = message.evidence.lastIndexOf(message.a, message.character);
                        message.character = start + 1;
                        evidence = message.a;
                    }

                    /* The bit below is obviously much more efficient, but JSHint reports
                    * the wrong character position when dealing with tabs.  So I have to
                    * manually go through and figure out the proper character position.
                    * Somehow W098 also reports the wrong position, whether using tabs or
                    * spaces.
                    message.character -= message.a.length;
                    evidence = message.a;
                    */

                    break;
                }
            }

            return evidence;
        }


        /**
        * Breaks up the message from jshint into something that can be used
        * by codemirror.
        *
        * @param message {Object} jshint message
        * @param settings {Object} jshint settings
        */
        function groom(message, settings) {
            // Don't inline this call in token because message gets changed in
            // processMessage, so all the message properties will not be correct
            // in the rest of the token
            var text = processMessage(message, settings);

            if (text === false){
                return false;
            }

            var token = {
                text: text,
                start: {
                    line: (message.line - 1),
                    ch: (message.character - 1)
                },
                end: {
                    line: (message.line - 1),
                    ch: (message.character - 1) + text.length
                }
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
