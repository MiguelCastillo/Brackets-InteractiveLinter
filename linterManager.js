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
        linters        = {},
        linterManager  = {};


    function Linter(cm, mode, fullPath) {
        this.cm            = cm;
        this.mode          = mode;
        this.reporter      = linterReporter();
        this.lint          = _.debounce(Linter.lint.bind(null, this, languages[mode], fullPath), 1000);
        this.onClickGutter = gutterClick.bind(null, this);
    }


    Linter.prototype.register = function() {
        this.cm.on("gutterClick", this.onClickGutter);
    };


    Linter.prototype.unregister = function() {
        this.cm.off("gutterClick", this.onClickGutter);
    };


    /**
     * Create instance of linter to process CodeMirror documents
     */
    Linter.factory = function(cm, fullPath) {
        var mode = cm && cm.getDoc().getMode();
        // Get the best poosible mode (document type) for the document
        mode = mode && (mode.helperType || mode.name);

        if (languages[mode]) {
            return new Linter(cm, mode, fullPath);
        }
    };


    /**
     * Interface that will be used for running linters
     */
    Linter.lint = function(linter, linterPlugin, fullPath) {
        linterSettings.loadSettings(linterPlugin.settingsFile, fullPath, linter).always(function(settings) {
            linterPlugin.lint(linter.cm.getDoc().getValue(), settings).done(function(result) {
                linter.reporter.report(linter.cm, result);
            });
        });
    };


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
     * @param {string} fullpath Is the path to the document being registered.  This is to
     *  load the most suitable settings file.
     *
     * @returns {Linter} Instance of linter to process the cm document
     */
    function registerDocument(cm, fullPath) {
        if (!cm) {
            throw new TypeError("Must provide a valid instance of CodeMirror");
        }

        var linter = cm.__linter || (cm.__linter = Linter.factory(cm, fullPath));

        if (!linter) {
            $(linterManager).triggerHandler("linterNotFound");
            return;
        }

        var gutters = cm.getOption("gutters").slice(0);

        // If a gutter for interactive linter does not exist, add one.
        if (gutters.indexOf("interactive-linter-gutter") === -1) {
            gutters.unshift("interactive-linter-gutter");
            cm.setOption("gutters", gutters);
        }

        linter.register();
        return linter;
    }


    function registerLinter(linter) {
        languages[linter.language] = linter;
        linters[linter.name] = linter;
    }


    linterManager.registerDocument = registerDocument;
    linterManager.registerLinter = registerLinter;
    return linterManager;
});

