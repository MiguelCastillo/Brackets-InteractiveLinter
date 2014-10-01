/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require /*, exports, module*/) {
    "use strict";

    var _ = brackets.getModule("thirdparty/lodash");
    var linterSettings = require("linterSettings"),
        linterReporter = require("linterReporter"),
        languages      = {},
        linters        = {};

    /**
     * Interface that will be used for running linters
     */
    function Linter(reporter, linterPlugin, cm, fullPath) {
        linterSettings.loadSettings(linterPlugin.settingsFile, fullPath, this).always(function(settings) {
            linterPlugin.lint(cm.getDoc().getValue(), settings).done(function(result) {
                reporter.report(cm, result);
            });
        });
    }


    /**
     * Show line details
     */
    function gutterClick(linter, cm, lineIndex, gutterId) {
        if (gutterId !== "interactive-linter-gutter"){
            return;
        }

        linter.reporter.toggleLineDetails(lineIndex);
    }


    /**
     * Interface to register documents that need an instance of the appropriate linter.
     *
     * @param {CodeMirror} cm Is the CodeMirror instance to enable interactive linting on.
     * @param {string} fullpath Is the path to the document being registered.  This is to
     *  load the most suitable settings file.
     */
    function registerDocument(cm, fullpath) {
        var gutters, linter;
        var mode = cm && cm.getDoc().getMode();

        $(this).triggerHandler("linterNotFound");

        var reporter = linterReporter();
        reporter.clearFatalError();

        // Get the best poosible mode (document type) for the document
        mode = mode && (mode.helperType || mode.name);

        if (cm && languages[mode]) {
            linter = cm.__linter;

            if (!linter) {
                linter = {};
                linter.reporter    = reporter;
                linter.lint        = _.debounce(Linter.bind(linter, linter.reporter, languages[mode], cm, fullpath), 1000);
                linter.gutterClick = gutterClick.bind(undefined, linter);
                linter.unregister  = unregisterDocument.bind(undefined, linter, cm);
                cm.__linter = linter;
            }

            cm.on("gutterClick", linter.gutterClick);
            gutters = cm.getOption("gutters").slice(0);

            // If a gutter for interactive linter does not exist, add one.
            if (gutters.indexOf("interactive-linter-gutter") === -1) {
                gutters.unshift("interactive-linter-gutter");
                cm.setOption("gutters", gutters);
            }

            return linter;
        }
    }


    function unregisterDocument(linter, cm) {
        cm.off("gutterClick", linter.gutterClick);
    }


    function registerLinter(linter) {
        languages[linter.language] = linter;
        linters[linter.name] = linter;
    }


    return {
        registerDocument: registerDocument,
        registerLinter: registerLinter
    };
});

