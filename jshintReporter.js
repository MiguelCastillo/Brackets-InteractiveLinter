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
    require('string');


    function reporter() {
        var _self = this;
        _self.marks = {};
    }


    /**
    * Routine that goes through all the jshint messages and generates data
    * that can be consumed by codemirror (cm).
    *
    * @param messages {Array} jshint messages
    * @param cm {CodeMirror} codemirror instance
    * @param settings {Object} jshint settings to further refine what does and doesn't
    *                       get reported
    */
    reporter.prototype.report = function(cm, messages, settings) {
        var _self = this;
        var token, handlerFunction;
        _self.clearMarks();
        _self.checkFatal(messages);
        _self.cm = cm;
        _self.messages = messages;

        $.each(messages.slice(0), function (index, message) {
            if (!message || !message.evidence) {
                return;
            }

            jshintMessages.ensureCode(message);

            // Get the handler for the code type
            handlerFunction = message.code[0].toLowerCase();

            if ( _self[handlerFunction] ) {
                token = _self.tokenize(message, settings);
                if ( !token ){
                    return;
                }

                // Do special handling for the message if need be
                _self[handlerFunction](message, token);

                // Add marks to gutter and line
                _self.addMarks(message, token);
            }
        });

        return this;
    };


    /**
    * Used for reporting errors.  The name is shorter to more directly match
    * to the code from jshint
    */
    reporter.prototype.e = function(message, token) {
        message.type = "error";
        //console.log("error", message, token);
    };


    /**
    * Used for reporting warnings.  The name is shorter to more directly match
    * to the code from jshint
    */
    reporter.prototype.w = function(message, token) {
        message.type = "warning";
        //console.log("warning", message, token);
    };


    /**
    * Add reporting information in code mirror's document
    */
    reporter.prototype.addMarks = function(message, token) {
        var _self = this, mark;

        if( !_self.marks[token.start.line] ) {
            _self.marks[token.start.line] = {
                warnings: [],
                errors: [],
                lineMarks:[],
                gutterMark: {
                    element: $("<div class='interactive-jshint-gutter-messages' title='Click for details'>&nbsp;</div>")
                }
            };

            mark = _self.marks[token.start.line];
            mark.gutterMark.line = _self.cm.setGutterMarker(token.start.line, "interactive-jshint-gutter", mark.gutterMark.element[0]);
        }

        // Add marks to the line that is reporting messages
        mark = _self.marks[token.start.line];
        mark.lineMarks.push({
            line: _self.cm.markText(token.start, token.end, {className: "interactive-jshint-" + message.code}),
            message: message
        });

        // Increment errors/warnings count
        if ( mark[message.type + "s"] ) {
            mark[message.type + "s"].push(message);
        }

        // If we have errors in this line, then we will add a class to the gutter to
        //highlight this fact.  Further more, I make sure I add this class only once...
        if ( message.type === "error" && mark.errors.length === 1 ) {
            mark.gutterMark.element.addClass('interactive-jshint-gutter-errors');
        }
    };


    /**
    * Clears all warning/errors from codemirror's document
    */
    reporter.prototype.clearMarks = function() {
        var _self = this;

        if (!_self.cm ){
            return;
        }

        _self.cm.clearGutter("interactive-jshint-gutter");
        $.each( _self.marks, function( index, mark ) {
            $.each( mark.lineMarks.slice(0), function(i1, textMark) {
                textMark.line.clear();
            });

            if (mark.lineWidget) {
                mark.lineWidget.widget.clear();
                delete mark.lineWidget;
            }

            delete mark.lineMarks;
            delete mark.gutterMarks;
        });

        _self.marks = {};
    };


    reporter.prototype.showLineDetails = function(cm, lineIndex, gutterId, event) {
        var mark = this.marks[lineIndex];

        // We don't have mark on this line, so we don't do anything...
        // This is just a line without any JSHint messages
        if (!mark) {
            return;
        }

        // Check if we have a line widget.  If we don't, then we set one up
        if (!mark.lineWidget) {
            mark.lineWidget = {
                visible: false,
                element: $("<div class='interactive-jshint-line-messages'></div>")
            };

            $.each([].concat(mark.errors, mark.warnings), function(index, message) {
                mark.lineWidget.element.append("<div class='interactive-jshint-line-{0} interactive-jshint-line-{1}'>{2}</div>".format(message.type, message.code, message.reason));
            });
        }

        if (mark.lineWidget.visible !== true) {
            var widgetSettings = {
                coverGutter: false,
                noHScroll: false,
                above: false,
                showIfHidden: false
            };

            mark.lineWidget.visible = true;
            mark.lineWidget.widget = this.cm.addLineWidget(lineIndex, mark.lineWidget.element[0], widgetSettings);
        }
        else {
            mark.lineWidget.visible = false;
            mark.lineWidget.widget.clear();
        }
    };


    /**
    * Checks messages to figure out if JSHint report a fatal failue.
    */
    reporter.prototype.checkFatal = function(messages) {
        // If the last message created by jshint is null, that means
        // that we have encoutered a fatal error...
        //
        /*
        * TODO: I would like to report the fact there is a fatal error
        * in a visual manner to the user
        */
        if (messages.length > 2 && !messages[messages.length - 1]) {
            // Get the last real error...
            var message = messages[messages.length - 2];
            console.log("Fatal failure", message);
            return true;
        }

        return false;
    };


    /**
    * Breaks up the message from jshint into something that can be used
    * by codemirror.
    *
    * @param message {Object} jshint message
    * @param settings {Object} jshint settings
    */
    reporter.prototype.tokenize = function(message, settings) {
        // Not sure why some characters are at 0...
        if (message.character === 0) {
            message.character = 1;
        }

        var evidence = message.evidence.substr(message.character - 1);
        var items = [];

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
                items  = evidence.split(/[\s;.]/);
                if ( items.length !== 0 ) {
                    evidence = evidence.substr(0, items[0].length);
                }
                break;
            }

            case "W055": {
                items = evidence.split(/[(\s;]/);
                if ( items.length !== 0 ) {
                    evidence = evidence.substr(0, items[0].length);
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

        //console.log(items, evidence);

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

        return {
            text: text,
            start: start,
            end: end
        };
    };


    var jshintReporter = (function () {
        var _reporter = new reporter();

        function report(cm, messages, settings) {
            return _reporter.report(cm, messages, settings || {});
        }

        function showLineDetails(cm, lineNumber, gutterId, event) {
            _reporter.showLineDetails(cm, lineNumber, gutterId, event);
        }

        return {
            report: report,
            showLineDetails: showLineDetails
        };
    })();


    return jshintReporter;
});
