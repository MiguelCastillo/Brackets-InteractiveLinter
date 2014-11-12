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
        Commands          = brackets.getModule("command/Commands"),
        CommandManager    = brackets.getModule("command/CommandManager"),
        ExtensionUtils    = brackets.getModule("utils/ExtensionUtils");

    require("lintIndicator");
    require("lintPanel");
    require("linterSettings");

    var linterManager = require("linterManager"),
        currentLinter,
        bracketsLinterEnabled = true;

    var CMD_SHOW_LINE_DETAILS = "MiguelCastillo.interactive-linter.showLineDetails";
    var SHORTCUT_KEY = "Ctrl-Shift-E";

    ExtensionUtils.loadStyleSheet(module, "style.less");


    function handleToggleLineDetails() {
        if (currentLinter) {
            currentLinter.reporter.toggleLineDetails();
        }
    }


    function handleDocumentChange() {
        currentLinter.lint();
    }


    function disableBracketsIndicator() {
        CodeInspection.toggleEnabled(false, true);

        var command = CommandManager.get(Commands.VIEW_TOGGLE_INSPECTION);
        bracketsLinterEnabled = command.getChecked();
        command.setChecked(false);
        command.setEnabled(false);

        $("#status-inspection").hide();
        $("#interactive-linter-lint-indicator").show();
    }


    function enableBracketsIndicator() {
        CodeInspection.toggleEnabled(true, true);

        var command = CommandManager.get(Commands.VIEW_TOGGLE_INSPECTION);
        command.setChecked(bracketsLinterEnabled);
        command.setEnabled(true);

        $("#status-inspection").show();
        $("#interactive-linter-lint-indicator").hide();
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
            setTimeout(disableBracketsIndicator);
        } else {
            setTimeout(enableBracketsIndicator);
        }
    }


    KeyBindingManager.addBinding(CMD_SHOW_LINE_DETAILS, SHORTCUT_KEY);
    CommandManager.register("Show Line Details", CMD_SHOW_LINE_DETAILS , handleToggleLineDetails);

    AppInit.appReady(function(){
        $(EditorManager).on("activeEditorChange.interactive-linter", setDocument);
        setDocument(null, EditorManager.getActiveEditor());
    });
});
