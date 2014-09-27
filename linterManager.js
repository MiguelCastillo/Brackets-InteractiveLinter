/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require /*, exports, module*/) {
    "use strict";

    var linterSettings = require("linterSettings"),
        linterReporter = require("linterReporter"),
        languages      = {},
        linters        = {};

    /**
     * Interface that will be used for running linters
     */
    function Linter(reporter, linterPlugin, cm, fullPath) {
        var _self  = this;
        var _timer = this._timer;

        if (_timer) {
            clearTimeout(_timer);
        }

        _self._timer = setTimeout(function () {
            _self._timer = null;

            linterSettings.loadSettings(linterPlugin.settingsFile, fullPath, _self).always(function(settings) {
                linterPlugin.lint(cm.getDoc().getValue(), settings).done(function(result) {
                    reporter.report(cm, result);
                });
            });
        }, 1000);
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
     * We will only handle one document at a time
     */
    function registerDocument(cm, fullpath) {
        var gutters, linter;
        var mode = cm && cm.getDoc().getMode();

        // Get the best poosible mode (document type) for the document
        mode = mode && (mode.helperType || mode.name);

        if (cm && languages[mode]) {
            linter = cm.__linter;

            if (!linter) {
                linter = {};
                linter.reporter    = linterReporter();
                linter.lint        = Linter.bind(linter, linter.reporter, languages[mode], cm, fullpath);
                linter.gutterClick = gutterClick.bind(undefined, linter);
                linter.unregister  = unregisterDocument.bind(undefined, linter, cm);
                cm.__linter = linter;
            }

            cm.on("gutterClick", linter.gutterClick);
            gutters = cm.getOption("gutters").slice(0);

            // Check if a gutter for interactive linter does not already exit...
            // If it does not, then add one.
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

