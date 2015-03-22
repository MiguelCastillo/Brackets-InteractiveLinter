/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require /*, exports, module*/) {
    "use strict";

    var _ = brackets.getModule("thirdparty/lodash");
    var Promise         = require("libs/js/spromise"),
        linterReporter  = require("linterReporter"),
        linterFactories = {},
        linterManager   = {};


    var languages = {
        "json": ["jsonlint"],
        "javascript": ["jsx", "jshint"]
    };


    var reporters = {
        "javascript": [linterReporter]
    };


    function Runner(cm, file) {
        this._file      = file;
        this._linters   = [];
        this._reporters = [];
        this.cm         = cm;
        this.lint       = _.debounce(lintDelegate.bind(null, this, file.fullPath), 1000);

        // Wire up gutter click handler
        this.onClickGutter = gutterClick.bind(null, this);
        this.cm.on("gutterClick", this.onClickGutter);
    }


    Runner.prototype.registerLinter = function(linter) {
        this._linters.push(linter);
    };


    Runner.prototype.registerReporter = function(reporter) {
        this._reporters.push(reporter);
        this.reporter = reporter;
    };


    Runner.prototype.dispose = function() {
        this.cm.off("gutterClick", this.onClickGutter);
    };


    Runner.create = function(cm, file) {
        var docType = Runner.getDocumentType(cm);
        if (!languages[docType]) {
            return;
        }

        var runner = new Runner(cm, file);

        // Register linter instances.
        languages[docType].forEach(function(linterName) {
            if (!linterFactories[linterName]) {
                console.error("Linter " + linterName + " was not found!");
            }

            runner.registerLinter(linterFactories[linterName].create());
        });

        // Register reporter instances.
        if (reporters[docType]) {
            reporters[docType].forEach(function(reporter) {
                runner.registerReporter(reporter(cm));
            });
        }
        else {
            runner.registerReporter(linterReporter(cm));
        }

        return runner;
    };


    Runner.runLinters = function(runner /*, fullPath*/) {
        return function linterDelegate(lintData) {
            function linterSequence(prev, linter) {
                return prev.then(function processLintResult(lintResult) {
                    if (lintResult) {
                        lintData.content = lintResult.content;
                        lintData.result  = lintData.result.concat(lintResult.result);
                    }

                    return lintData.content ? linter.lint(lintData) : null;
                });
            }

            return runner._linters.reduce(linterSequence, Promise.resolve(lintData));
        };
    };


    Runner.runReporters = function(runner /*, fullPath*/) {
        return function reporterDelegate(lintResult) {
            function reporterSequence(prev, reporter) {
                return prev.then(function() {
                    return reporter.report(lintResult.result);
                });
            }

            return runner._reporters.reduce(reporterSequence, Promise.resolve());
        };
    };


    Runner.getDocumentType = function(cm) {
        // Get the best poosible mode (document type) for the document
        var documentType = cm && cm.getDoc().getMode();
        return documentType && (documentType.helperType || documentType.name);
    };


    function lintDelegate(runner, fullPath) {
        var lintData = {
            fullPath : fullPath,
            content  : stripMinified(runner.cm.getDoc().getValue()),
            result   : []
        };

        return Runner.runLinters(runner, fullPath)(lintData)
            .then(Runner.runReporters(runner, fullPath));
    }


    /**
     * Show line details
     */
    function gutterClick(linter, cm, lineIndex, gutterId) {
        if (gutterId !== "interactive-linter-gutter") {
            return;
        }

        linter.reporter.toggleLineDetails(lineIndex);
    }


    /**
     * Interface to register documents that need an instance of the appropriate linter.
     *
     * @param {CodeMirror} cm Is the CodeMirror instance to enable interactive linting on.
     * @param {File} file - Is the file for the document being registered.  This is to
     *  load the most suitable settings file.
     *
     * @returns {Linter} Instance of linter to process the cm document
     */
    function registerDocument(cm, file) {
        if (!cm) {
            throw new TypeError("Must provide an instance of CodeMirror");
        }

        var runner = cm.__lintrunner || (cm.__lintrunner = Runner.create(cm, file));
        if (!runner) {
            $(linterManager).triggerHandler("linterNotFound");
            return;
        }

        var gutters = cm.getOption("gutters").slice(0);
        if (gutters.indexOf("interactive-linter-gutter") === -1) {
            gutters.unshift("interactive-linter-gutter");
            cm.setOption("gutters", gutters);
        }

        return runner;
    }


    function registerLinter(linter) {
        linterFactories[linter.name] = linter;
    }


    /**
     * Strips out any line that longer than 250 characters as a way to guess if the code is minified
     */
    function stripMinified(text) {
        // var regex = /function[ ]?\w*\([\w,]*\)\{(?:\S[\s]?){150,}\}/gm;
        // var regex = /(?:\S[\s]?){250,}[\n]$/gm;
        var regex = /(?:.){500,}/gm;
        return text.replace(regex, "");
    }


    linterManager.registerDocument = registerDocument;
    linterManager.registerLinter   = registerLinter;
    return linterManager;
});
