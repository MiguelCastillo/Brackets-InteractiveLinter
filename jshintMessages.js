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

    var messages = require('messages');
    var _code;

    var jshintMessages = (function () {

        // Make sure we always have some sort of code... If jshint does not
        // provide one, we will just set it to a known 'fake' warning code
        // W000.
        function ensureCode(message) {
            if (!message.code) {
                // Search for warnings first since these are the most commonly
                // reported messages.
                _code = messages.warningsByDescription[message.raw];

                // If no warnings were found, then search in errors.
                if (!_code) {
                    _code = messages.errorsByDescription[message.raw];
                }

                // Last bucket for searching is info
                if (!_code) {
                    _code = messages.infoByDescription[message.raw];
                }

                // Fallback to manually match codes...
                if (!_code) {
                    if (message.raw.indexOf("Expected a 'break' statement before") === 0) {
                        _code = messages.warnings["W086"];
                    }
                }

                // If we have found a code, then we use it, otherwise let's use
                // a generic code that will not interfer with real JSHint messages
                if (_code) {
                    message.code = _code.code;
                }
                else {
                    message.code = "W000";
                }
            }
        }

        return {
            ensureCode: ensureCode
        };
    })();


    return jshintMessages;
});

