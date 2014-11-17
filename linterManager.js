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
        linterManager;

    /**
     * Interface that will be used for running linters
     */
    function Linter(reporter, cm) {
        var currentFile = EditorManager.getActiveEditor().document.file;
        CodeInspection.inspectFile(currentFile).done(function (result) {
            reporter.report(cm, result);
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


        function unregisterDocument(linter, cm) {
        cm.off("gutterClick", linter.gutterClick);
    }


    /**
     * Interface to register documents that need an instance of the appropriate linter.
     *
     * @param {CodeMirror} cm Is the CodeMirror instance to enable interactive linting on.
     */
    function registerDocument(cm) {
        var gutters, linter;
        var mode = cm && cm.getDoc().getMode();

        $(linterManager).triggerHandler("linterNotFound");

        // Get the best poosible mode (document type) for the document
        mode = mode && (mode.helperType || mode.name);

        if (cm) {
            linter = cm.__linter;

            if (!linter) {
                linter = {};
                linter.reporter    = linterReporter();
                linter.lint        = _.debounce(Linter.bind(linter, linter.reporter, cm), 1000);
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


    linterManager = {
        registerDocument: registerDocument
    };

    return linterManager;
});
