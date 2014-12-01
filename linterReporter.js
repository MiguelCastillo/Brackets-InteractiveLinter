/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    "use strict";

    var spromise = require("libs/js/spromise");

    var EditorManager     = brackets.getModule("editor/EditorManager"),
        CodeInspection    = brackets.getModule("language/CodeInspection"),
        InlineWidget      = brackets.getModule("editor/InlineWidget").InlineWidget,
        _                 = brackets.getModule("thirdparty/lodash");

    var inlineWidgetLintTemplate = require("text!templates/inlineWidgetLint.html"),
        linterReporter;


    function Reporter() {
        this.marks = {};
    }


    /**
     * Routine that goes through all the linter messages and adds all the gutter
     * symbols and the underlines.
     *
     * @param result {?Array.<{provider:Object, result: ?{errors:!Array, aborted:boolean}}>} linter result
     * @param cm {CodeMirror} codemirror instance
     */
    Reporter.prototype.report = function(cm, result) {
        var _self = this;

        this.lastResult = result;

        if (this.lastRequest && this.lastRequest.state() === "pending") {
            return;
        }

        this.lastRequest = this._runReport(cm, result).always(function () {
            _self.lastRequest = null;
            if (_self.lastResult !== result) {
                _self.report(cm, _self.lastResult);
            }
        });
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
    Reporter.prototype.addGutterMarks = function (message) {
        var mark = this.marks[message.pos.line];

        // gutterMark is the placehoder for the lightbulb
        // lineMarks are the underlines in the places the errors are reported for

        if (!mark) {
            mark = {
                messages: {},
                reducedMessages: [],
                lineMarks: [],
                gutterMark: {
                    element: $("<div class='interactive-linter-gutter-messages' title='Click for details'>&nbsp;</div>")
                }
            };

            this.marks[message.pos.line] = mark;
            mark.gutterMark.line = this.cm.setGutterMarker(message.pos.line, "interactive-linter-gutter", mark.gutterMark.element[0]);
        }


        if (mark.messages[message.type]) {
            mark.messages[message.type].push(message);
        } else {
            mark.messages[message.type] = [message];
        }


        mark.reducedMessages = _.reduce(mark.messages, function (accumulator, value) {
            return accumulator.concat(value);
        }, []);
    };


    /**
     * Routine to underline problems in documents
     */
    Reporter.prototype.addLineMarks = function (message) {
        var mark  = this.marks[message.pos.line];

        // Add line marks
        mark.lineMarks.push({
            line: this.cm.markText(message.pos, message.endpos, {className: "interactive-linter-text-mark"}),
            message: message
        });
    };


    /**
     * Clears all warning/errors from codemirror's document
     */
    Reporter.prototype.clearMarks = function () {
        var _self = this;

        if (!this.cm) {
            return;
        }

        this.cm.clearGutter("interactive-linter-gutter");

        _.forEach(this.marks, function (mark) {
            _.forEach(mark.lineMarks, function (textMark) {
                textMark.line.clear();
            });

            if (mark.inlineWidget) {
                _self.hideLineDetails(mark.inlineWidget);
                delete mark.inlineWidget;
            }

            delete mark.messages;
            delete mark.lineMarks;
            delete mark.gutterMarks;
        });

        this.marks = {};
    };


    Reporter.prototype.getWidgetForLine = function (line) {
        var activeEditor  = EditorManager.getActiveEditor();
        var inlineWidgets = activeEditor.getInlineWidgets();

        return _.find(inlineWidgets, function (widget) {
            return widget.interactiveLinterLineNumber === line;
        });
    };


    Reporter.prototype.toggleLineDetails = function (line) {
        var activeEditor = EditorManager.getActiveEditor();
        var cursorPos    = line !== undefined ? {line: line, ch: 0} : activeEditor.getCursorPos();
        var lineWidget   = this.getWidgetForLine(cursorPos.line);

        if (lineWidget) {
            this.hideLineDetails(lineWidget);
        }
        else {
            this.showLineDetails(line);
        }
    };


    Reporter.prototype.hideLineDetails = function (widget) {
        EditorManager.getActiveEditor().removeInlineWidget(widget);
    };


    Reporter.prototype.showLineDetails = function (line) {
        var activeEditor = EditorManager.getActiveEditor();
        var cursorPos = line !== undefined ? {line: line, ch: 0} : activeEditor.getCursorPos();

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

        var messages = mark.reducedMessages;

        var results = [];
        _.forEach(messages, function (message) { // Allows Mustache to iterate over the messages, grouped by provider.
            if (message) {
                var key = message.providerName;
                var keyIndex = _.findKey(results, { providerName: key });

                if (keyIndex) {
                    results[keyIndex].result.problems.push(message);
                } else {
                    results.push({
                        providerName: key,
                        result: {
                            problems: [message]
                        }
                    });
                }
            }
        });

        var $errorHtml = $(Mustache.render(inlineWidgetLintTemplate, {results: results}));

        inlineWidget.$htmlContent.append($errorHtml);

        $errorHtml.on("mousedown", function (e) {
            e.stopPropagation();
        });

        $errorHtml.on("click", ".inspector-title", function (e) {
            var $title = $(e.target);
            $title.toggleClass("expanded");

            var $inspectorProblems = $title.parent().find(".inspector-problems");
            $inspectorProblems.toggle($title.hasClass("expanded"));

            activeEditor.setInlineWidgetHeight(inlineWidget, $errorHtml.height() + 20);
        });

        activeEditor.setInlineWidgetHeight(inlineWidget, $errorHtml.height() + 20);
    };


    Reporter.prototype.messageLoop = function (result, callback) {
       _.forEach(result, function (providerObject) {
            if (!providerObject || !providerObject.result) {
                return;
            }

            _.forEach(providerObject.result.errors, function (message) {
                return callback(providerObject.provider, message);
            });
        });
    };


    /**
     * Determines if there is a fatal error in the linting report
     */
    Reporter.prototype.checkFatal = function (result) {
        var abortedProvider;

        _.forEach(result, function (providerObject) {
            if (providerObject.result && providerObject.result.aborted) {
                abortedProvider = providerObject;

                /**
                 * Makes the first aborted provider the one we report the fatal error for, not the last.
                 * LoDash forEach stops iterating when an explicit false is returned.
                 */
                return false;
            }
        });

        if (abortedProvider) {
            var messages = abortedProvider.result.errors;
            if (messages.length > 2 && !messages[messages.length - 1]) {
                $(linterReporter).triggerHandler("fatalError", messages[messages.length - 2]);
                return true;
            }
        }

        $(linterReporter).triggerHandler("fatalError", null); // Clears a fatal error
        return false;
    };


    Reporter.prototype.groomResult = function (result) {
        var currentDoc = EditorManager.getActiveEditor().document;

        result = _.filter(result, function (resultObject) {
            return resultObject.result && resultObject.result.errors.length !== 0;
        });


        // Augment error objects with additional fields needed by Mustache template
        this.messageLoop(result, function (provider, message) {
            // some inspectors don't always provide a line number or report a negative line number
            var messageLine = currentDoc.getLine(message.pos.line);
            if (!isNaN(message.pos.line) && (message.pos.line + 1) > 0 && messageLine !== undefined) {
                message.friendlyLine = message.pos.line + 1;
                message.codeSnippet = messageLine.substr(0, Math.min(175, messageLine.length));  // limit snippet width
            }

            var token = this.cm.getTokenAt({
                line: message.pos.line,
                ch: message.pos.ch + 1
            });
            var index = token ? token.end : -1;

            if (index < message.pos.ch) {
                index = messageLine.length;
            }

            if (index === message.pos.ch && message.pos.ch > 0) {
                message.pos.ch--;
            }

            message.endpos = {
                line: message.pos.line,
                ch: index
            };


            message.providerName = provider.name;
            message.cssType = _.findKey(CodeInspection.Type, function (type) {
                return type === message.type;
            }).toLowerCase();
        }.bind(this));

        return result;
    };


    Reporter.prototype._runReport = function (cm, result) {
        var _self = this;
        var deferred = spromise.defer();


        // Run as operation for best performance
        setTimeout(function () {
            cm.operation(function() {
                _self.clearMarks();

                if (result) {

                    _self.cm       = cm;
                    result         = _self.groomResult(result);
                    _self.result   = result;
                    _self.checkFatal(result);

                    _self.messageLoop(result, function (providerObject, message) {
                        if (message) {
                            _self.addGutterMarks(message);
                            _self.addLineMarks(message);
                        }
                    });
                }

                $(linterReporter).triggerHandler("lintMessage", [result]);

                deferred.resolve();
            });
        }, 0);

        return deferred.promise;
    };


    linterReporter = function () {
        var _reporter = new Reporter();

        function report(cm, messages) {
            return _reporter.report(cm, messages);
        }

        function toggleLineDetails(line) {
            _reporter.toggleLineDetails(line);
        }

        return {
            report: report,
            toggleLineDetails: toggleLineDetails
        };
    };


    return linterReporter;
});
