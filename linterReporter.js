/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    'use strict';

    var spromise = require("libs/js/spromise");

    var EditorManager     = brackets.getModule("editor/EditorManager"),
        InlineWidget      = brackets.getModule("editor/InlineWidget").InlineWidget,
        _                 = brackets.getModule("thirdparty/lodash");
    
    var INLINE_WIDGET_LINT_TEMPLATE = require("text!templates/inlineWidgetLint.html");

    var msgId = 1;
    var pending, lastRequest;

    function Reporter() {
        this.marks = {};
    }


    /**
     * Routine that goes through all the jshint messages and adds all the gutter
     * symbols and the underlines.
     *
     * @param messages {Array} jshint messages
     * @param cm {CodeMirror} codemirror instance
     */
    Reporter.prototype.report = function(cm, messages) {
        var _self = this;
        pending = msgId;
        if (lastRequest && lastRequest.state() === "pending") {
            return this;
        }

        lastRequest = runReport(_self, pending, cm, messages).done(function(doneId) {
            lastRequest = null;
            if (pending !== doneId) {
                console.log("run pending", pending);
                _self.report(cm, messages);
            }
        });

        msgId++;
        return this;
    };


    /**
     * Add reporting information in code mirror's document
     *
     * Message requires:
     * - type,
     * - code,
     * - raw,
     * - reason,
     * - href
     *
     * Token is a CodeMirror token that specifies start/end information for
     * the string in CodeMirror's document
     */
    Reporter.prototype.addGutterMarks = function(message, token) {
        var _self = this, mark;

        //
        // gutterMark is the placehoder for the lightbulb
        // lineMarks are the underlines in the places the errors are reported for
        //

        if (!_self.marks[token.start.line]) {
            mark = {
                warnings: [],
                errors: [],
                lineMarks:[],
                gutterMark: {
                    element: $("<div class='interactive-linter-gutter-messages' title='Click for details'>&nbsp;</div>")
                }
            };

            _self.marks[token.start.line] = mark;
            mark.gutterMark.line = _self.cm.setGutterMarker(token.start.line, "interactive-linter-gutter", mark.gutterMark.element[0]);
        }

        // Add marks to the line that is reporting messages
        mark = _self.marks[token.start.line];

        // Increment errors/warnings count
        if (mark[message.type + "s"]) {
            mark[message.type + "s"].push(message);
        }

        // If we have errors in this line, then we will add a class to the gutter to
        // highlight this fact.  Furthermore, I make sure I add this class only once...
        if (message.type === "error" && mark.errors.length === 1) {
            mark.gutterMark.element.addClass('interactive-linter-gutter-errors');
        }
    };


    /**
     * Routine to underline problems in documents
     */
    Reporter.prototype.addLineMarks = function (message, token) {
        var _self = this,
            mark  = _self.marks[token.start.line];

        // Add line marks
        mark.lineMarks.push({
            line: _self.cm.markText(token.start, token.end, {className: "interactive-linter-" + message.type}),
            message: message
        });
    };


    /**
     * Clears all warning/errors from codemirror's document
     */
    Reporter.prototype.clearMarks = function() {
        var _self = this;

        if (!_self.cm) {
            return;
        }

        _self.cm.clearGutter("interactive-linter-gutter");

        _.forEach(_self.marks, function(mark) {
            _.forEach(mark.lineMarks.slice(0), function(textMark) {
                textMark.line.clear();
            });

            if (mark.inlineWidget) {
                _self.hideLineDetails(mark.inlineWidget);
                delete mark.inlineWidget;
            }

            delete mark.errors;
            delete mark.warnings;
            delete mark.lineMarks;
            delete mark.gutterMarks;
        });

        _self.marks = {};
    };


    Reporter.prototype.getWidgetForLine = function (line) {
        var activeEditor  = EditorManager.getActiveEditor();
        var inlineWidgets = activeEditor.getInlineWidgets();
        var foundWidget;

        if (inlineWidgets.length > 0) {
            foundWidget = _.find(inlineWidgets, function (widget) {
                if (widget.hasOwnProperty('interactiveLinterLineNumber') && widget.interactiveLinterLineNumber === line) {
                    return true;
                }
            });

        }
        return foundWidget;
    };


    Reporter.prototype.toggleLineDetails = function (line) {
        var activeEditor = EditorManager.getActiveEditor();
        var cursorPos    = line !== undefined ? {line: line, ch: 0} : activeEditor.getCursorPos();
        var foundWidget  = this.getWidgetForLine(cursorPos.line);

        if (foundWidget) {
            this.hideLineDetails(foundWidget);
        }
        else {
            this.showLineDetails(line);
        }
    };


    Reporter.prototype.hideLineDetails = function (widget) {
        EditorManager.getActiveEditor().removeInlineWidget(widget);
    };


    Reporter.prototype.showLineDetails = function(line) {
        var activeEditor = EditorManager.getActiveEditor();
        var cursorPos = typeof line !== 'undefined' ? {line: line, ch: 0} : activeEditor.getCursorPos();

        var mark = this.marks[cursorPos.line];

        if (!mark) {
            return;
        }

        var inlineWidget = new InlineWidget();
        mark.inlineWidget = inlineWidget;
        inlineWidget.load(EditorManager.getActiveEditor());
        inlineWidget.interactiveLinterLineNumber = cursorPos.line;
        activeEditor.addInlineWidget(cursorPos, inlineWidget, true);

        this.updateLineDetails(mark);
    };


    Reporter.prototype.updateLineDetails = function (mark) {
        var activeEditor = EditorManager.getActiveEditor();
        var inlineWidget = mark.inlineWidget;

        var messages = [].concat(mark.errors, mark.warnings);

        var $errorHtml = $(Mustache.render(INLINE_WIDGET_LINT_TEMPLATE, {messages: messages}));

        inlineWidget.$htmlContent.append($errorHtml);
        activeEditor.setInlineWidgetHeight(inlineWidget, $errorHtml.height() + 20);
    };


    /**
     * Determines if there is a fatal error in the linting report
     */
    Reporter.prototype.checkFatal = function(messages) {
        // If the last message created by jshint is null, that means
        // that we have encoutered a fatal error...
        if (messages.length > 2 && !messages[messages.length - 1]) {
            $(linterReporter).triggerHandler("fatalError", messages[messages.length - 2]);
            return true;
        }

        this.clearFatalError();
        return false;
    };


    Reporter.prototype.clearFatalError = function() {
        $(linterReporter).triggerHandler("fatalError", [null]);
    };


    Reporter.prototype.clearLinterMessages = function() {
        this.clearFatalError();
        $(linterReporter).triggerHandler("lintMessage", [null]);
    };


    function runReport(_self, reportId, cm, messages) {
        var deferred = spromise.defer();

        setTimeout(function() {
            // Run as operation for best performance
            cm.operation(function() {
                _self.clearMarks();

                if (messages) {
                    $(linterReporter).triggerHandler("lintMessage", [messages]);
                    _self.checkFatal(messages);
                    _self.cm       = cm;
                    _self.messages = messages;

                    _.forEach(messages, function (message) {
                        if (!message) {
                            return;
                        }

                        if (message.token) {
                            _self.addGutterMarks(message, message.token);
                            _self.addLineMarks(message, message.token);
                        }
                    });
                }
                else {
                    $(linterReporter).triggerHandler("lintMessage", [[]]);
                }

                deferred.resolve(reportId);
            });
        }, 0);

        return deferred.promise;
    }


    function linterReporter () {
        var _reporter = new Reporter();

        function report(cm, messages) {
            return _reporter.report(cm, messages);
        }

        function toggleLineDetails(line) {
            _reporter.toggleLineDetails(line);
        }

        function clearFatalError() {
            _reporter.clearFatalError();
        }

        function clearLinterMessages() {
            _reporter.clearLinterMessages();
        }

        return {
            report: report,
            toggleLineDetails: toggleLineDetails,
            clearFatalError: clearFatalError,
            clearLinterMessages: clearLinterMessages
        };
    }


    return linterReporter;
});
