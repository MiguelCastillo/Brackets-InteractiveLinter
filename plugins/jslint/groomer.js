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


define(function (require, exports, module) {
    'use strict';

    var JSLintError = require('JSLintError');


    /**
    * Breaks up the message from jshint into something that can be used
    * by codemirror.
    *
    * @param message {Object} jshint message
    * @param settings {Object} jshint settings
    */
    function groom(message, settings) {
        var token = new JSLintError(message, settings);
        message.type = message.type || "warning";

        // Add href for help
        message.href = "http://jslinterrors.com/" + (message.raw || "").replace(/'*\{*(\w*)\}*'*/g, "$1").replace(/\s/g, '-').replace(/\.$/, '').toLowerCase();

        return {
            text: token.evidence,
            start: token.startPosition,
            end: token.endPosition
        };
    }


    return {
        groom: groom
    };

});
