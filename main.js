/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    'use strict';

    // Reference for jshint errors/warnings
    // http://jslinterrors.com

    var EditorManager     = brackets.getModule("editor/EditorManager"),
        CodeInspection    = brackets.getModule("language/CodeInspection"),
        AppInit           = brackets.getModule("utils/AppInit"),
        KeyBindingManager = brackets.getModule("command/KeyBindingManager"),
        CommandManager    = brackets.getModule("command/CommandManager"),
        ExtensionUtils    = brackets.getModule("utils/ExtensionUtils");

    require("errorIndicator");
    require("linterSettings");

    var linterManager = require("linterManager"),
        pluginManager = require("pluginManager"),
        currentLinter;

    var CMD_SHOW_LINE_DETAILS = "MiguelCastillo.interactive-linter.showLineDetails";
    var SHORTCUT_KEY = "Ctrl-Shift-E";

    ExtensionUtils.loadStyleSheet(module, "style.css");


    function handleToggleLineDetails() {
        currentLinter.reporter.toggleLineDetails();
    }


    function handleDocumentChange() {
        currentLinter.lint();
    }


    function setDocument(event, currentEditor, previousEditor) {
        // Unregister current linter instance
        if (currentLinter) {
            currentLinter.unregister();
            currentLinter = null;
        }

        if (previousEditor) {
            $(previousEditor).off("editorChange", handleDocumentChange);
        }

        if (currentEditor) {
            currentLinter = linterManager.registerDocument(currentEditor._codeMirror, currentEditor.document.file.parentPath);
        }

        // If a linter was successfully created, then we are safe to bind event handlers for editor changes.
        if (currentLinter) {
            $(currentEditor).on("editorChange", handleDocumentChange);
            currentLinter.lint();
        }
    }

    function removeBracketsLinter() {
        /**
         * Removes the default Brackets JSLint linter
         */
        CodeInspection.register("javascript", {
            name: "interactive-linter-remove-jslint",
            scanFile: $.noop
        });
    }


    KeyBindingManager.addBinding(CMD_SHOW_LINE_DETAILS, SHORTCUT_KEY);
    CommandManager.register("Show Line Details", CMD_SHOW_LINE_DETAILS , handleToggleLineDetails);

    AppInit.appReady(function(){
        removeBracketsLinter();

        pluginManager().done(function(plugins) {
            for (var iPlugin in plugins) {
                linterManager.registerLinter(plugins[iPlugin]);
            }

            $(EditorManager).on("activeEditorChange.interactive-linter", setDocument);
            setDocument(null, EditorManager.getActiveEditor());
        });
    });
});
