/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require /*, exports, module*/) {
    "use strict";

    var EditorManager  = brackets.getModule("editor/EditorManager"),
        CodeInspection = brackets.getModule("language/CodeInspection"),
        _              = brackets.getModule("thirdparty/lodash");

    var linterReporter = require("linterReporter"),
        linterManager  = {};


    /**
     * Represents a linter, with its reporter, codemirror, lint methods.
     * @param {Object} cm CodeMirror instance
     */
    function Linter(cm) {
        this.cm            = cm;
        this.reporter      = linterReporter();
        this.lint          = _.debounce(Linter.lint.bind(null, this), 1000);
    }


    Linter.prototype.register = function() {
        this.cm.on("gutterClick", this.onGutterClick.bind(this));
    };


    Linter.prototype.unregister = function() {
        this.cm.off("gutterClick", this.onGutterClick.bind(this));
    };


    /**
     * Interface to run linters
     */
    Linter.lint = function(linter) {
        var currentFile = EditorManager.getActiveEditor().document.file;
        CodeInspection.inspectFile(currentFile).done(function (result) {
            linter.reporter.report(linter.cm, result);
        });
    };


    /**
     * Show line details when clicking on the interactive linter gutter.
     * @param {Object} cm        CodeMirror instance
     * @param {Number} lineIndex The line number of the line for which the gutter was clicked.
     * @param {String} gutterId  The ID of the gutter
     */
    Linter.prototype.onGutterClick = function onGutterClickHandler(cm, lineIndex, gutterId) {
        if (gutterId !== "interactive-linter-gutter") {
            return;
        }

        this.reporter.toggleLineDetails(lineIndex);
    };


    /**
     * Interface to register documents that need an instance of the appropriate linter.
     *
     * @param {CodeMirror} cm Is the CodeMirror instance to enable interactive linting on.
     *
     * @returns {Linter} Instance of linter to process the cm document
     */
    function registerDocument(cm) {
        if (!cm) {
            throw new TypeError("Must provide an instance of CodeMirror");
        }

        var linter = cm.__linter || (cm.__linter = new Linter(cm));

        $(linterManager).triggerHandler("linterNotFound"); // TODO: Check if there are linters in CodeInspection

        var gutters = cm.getOption("gutters").slice(0);

        // If a gutter for interactive linter does not exist, add one.
        if (gutters.indexOf("interactive-linter-gutter") === -1) {
            gutters.unshift("interactive-linter-gutter");
            cm.setOption("gutters", gutters);
        }

        linter.register();
        return linter;
    }


    linterManager.registerDocument = registerDocument;
    return linterManager;
});
