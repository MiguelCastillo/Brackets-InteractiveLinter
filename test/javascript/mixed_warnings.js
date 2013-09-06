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


/*jslint plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, CodeMirror */

define(['require', 'exports', 'module'], function (require, exports, module) {
    'use strict';


    function handler(messages, cm){
        var _self = this;
        this.cm = cm;
        this.messages = messages;

        $.each(messages.slice(0), function (index, message) {
            console.log(message);

            if (!message){
                return;
            }

            if (!message.evidence){
                return;
            }

            if (!message.code){
                return;
            }

            switch(message.code[0].toLowerCase()){
                case 'w': {
                    _self.warning(message);
                    break;
                }
                case 'e': {
                    _self.error(message);
                    break;
                }
            }
        });
    }


    handler.prototype.error = function(error){

    };


    handler.prototype.warning = function(warning){

    };


    var jshintReporter = (function () {
        function report(messages, cm) {
            if (!messages[messages.length - 1]){
                console.log("Fatal error");
            }

            new handler(messages, cm);
        }

        return {
            report: report
        };
    })();


    return jshintReporter;
});
