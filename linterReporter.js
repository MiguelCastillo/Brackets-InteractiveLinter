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

    require('string');

    /**
    * Bypass groomer that simply returns the message that is passed it.
    * Used in situations where the messages that need to be reported do
    * not need further processing and all the information needed by the
    * reporter is in the message itself
    */
    var noopGroomer = {
            groom: function(message){
                return message;
            }
        };


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
    reporter.prototype.report = function(cm, messages, groomer) {
        var _self = this;
        var token;
        _self.clearMarks();
        _self.checkFatal(messages);
        _self.cm = cm;
        _self.messages = messages;

        $.each(messages.slice(0), function (index, message) {
            if (!message || !message.evidence) {
                return;
            }

            // Process message with the groomer to make sure we are getting a token
            // that code mirror can use
            token = groomer.groom(message);

            if (token){
                // Add marks to gutter and line
                _self.addGutterMarks(message, token);
            }
        });

        return this;
    };


    /**
    * Add reporting information in code mirror's document
    */
    reporter.prototype.addGutterMarks = function(message, token) {
        var _self = this, mark;

        if( !_self.marks[token.start.line] ) {
            _self.marks[token.start.line] = {
                warnings: [],
                errors: [],
                lineMarks:[],
                gutterMark: {
                    element: $("<div class='interactive-linter-gutter-messages' title='Click for details'>&nbsp;</div>")
                }
            };

            mark = _self.marks[token.start.line];
            mark.gutterMark.line = _self.cm.setGutterMarker(token.start.line, "interactive-linter-gutter", mark.gutterMark.element[0]);
        }

        // Add marks to the line that is reporting messages
        mark = _self.marks[token.start.line];
        mark.lineMarks.push({
            line: _self.cm.markText(token.start, token.end, {className: "interactive-linter-" + message.code}),
            message: message
        });

        // Increment errors/warnings count
        if ( mark[message.type + "s"] ) {
            mark[message.type + "s"].push(message);
        }

        // If we have errors in this line, then we will add a class to the gutter to
        //highlight this fact.  Further more, I make sure I add this class only once...
        if ( message.type === "error" && mark.errors.length === 1 ) {
            mark.gutterMark.element.addClass('interactive-linter-gutter-errors');
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

        _self.cm.clearGutter("interactive-linter-gutter");

        $.each( _self.marks, function( index, mark ) {
            $.each( mark.lineMarks.slice(0), function(i1, textMark) {
                textMark.line.clear();
            });

            if (mark.lineWidget) {
                mark.lineWidget.widget.clear();
                delete mark.lineWidget;
            }

            delete mark.errors;
            delete mark.warnings;
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
                element: $("<div class='interactive-linter-line-messages'></div>")
            };

            $.each([].concat(mark.errors, mark.warnings), function(index, message) {
                var href = "http://jslinterrors.com/" + (message.raw || "").replace(/'*\{*(\w*)\}*'*/g, "$1").replace(/\s/g, '-').replace(/\.$/, '').toLowerCase();
                mark.lineWidget.element.append("<div class='interactive-linter-line-{0} interactive-linter-line-{1}'>{2} - {1} - <a href='{3}' target='interactivelinter'>Details</a></div>".format(message.type, message.code, message.reason, href));
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


    var linterReporter = (function () {
        var _reporter = new reporter();

        function report(cm, messages, groomer) {
            if( !groomer ){
                groomer = noopGroomer;
            }

            return _reporter.report(cm, messages, groomer);
        }

        function showLineDetails(cm, lineNumber, gutterId, event) {
            _reporter.showLineDetails(cm, lineNumber, gutterId, event);
        }

        return {
            report: report,
            showLineDetails: showLineDetails
        };
    })();


    return linterReporter;
});
