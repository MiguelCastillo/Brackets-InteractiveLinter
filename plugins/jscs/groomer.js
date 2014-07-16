/*
 * Copyright (c) 2014 Santhosh Thottingal
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

	/**
	 * Breaks up the message from jshint into something that can be used
	 * by codemirror.
	 *
	 * @param message {Object} jshint message
	 * @param settings {Object} jshint settings
	 */
	function groom(message, settings) {
		var text, token;

		if (!message) {
			return;
		}
		text = message.message + '';

		if (text === false) {
			return false;
		}
		message.type = message.type || 'warning';
		message.reason = text;
		token = {
			text: text,
			start: {
				line: (message.line - 1),
				ch: (message.column - 1)
			},
			end: {
				line: (message.line - 1),
				ch: (message.column - 1) + text.length
			}
		};
		return token;
	}

	return {
		groom: groom
	};

});