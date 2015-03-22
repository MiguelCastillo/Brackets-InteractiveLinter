/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    "use strict";

    // Reference for jshint errors/warnings
    // http://jslinterrors.com

    var EditorManager     = brackets.getModule("editor/EditorManager"),
        CodeInspection    = brackets.getModule("language/CodeInspection"),
        AppInit           = brackets.getModule("utils/AppInit"),
        KeyBindingManager = brackets.getModule("command/KeyBindingManager"),
        Commands          = brackets.getModule("command/Commands"),
        CommandManager    = brackets.getModule("command/CommandManager"),
        ExtensionUtils    = brackets.getModule("utils/ExtensionUtils"),
        linterManager     = require("linterManager"),
        pluginManager     = require("pluginManager");

    require("lintIndicator");
    require("lintPanel");
    require("linterSettings");

    var bracketsLinterEnabled = true;
    var CMD_SHOW_LINE_DETAILS = "MiguelCastillo.interactive-linter.showLineDetails";
    var SHORTCUT_KEY          = "Ctrl-Shift-E";
    var linter;

    ExtensionUtils.loadStyleSheet(module, "style.less");
    KeyBindingManager.addBinding(CMD_SHOW_LINE_DETAILS, SHORTCUT_KEY);
    CommandManager.register("Show Line Details", CMD_SHOW_LINE_DETAILS , handleToggleLineDetails);
    AppInit.appReady(appReady);


    /**
     * Toggles open/close the inline details widget.
     */
    function handleToggleLineDetails() {
        if (linter) {
            linter.reporter.toggleLineDetails();
        }
    }


    /**
     * Function to cause a lint operation
     */
    function handleDocumentChange() {
        linter.lint();
    }


    /**
     * Function to disable the native linter indicator in Brackets.  This is
     * because interactive linter has its own indicator and we don't want any
     * conflicts.
     */
    function disableBracketsIndicator() {
        CodeInspection.toggleEnabled(false, true);

        var command = CommandManager.get(Commands.VIEW_TOGGLE_INSPECTION);
        bracketsLinterEnabled = command.getChecked();
        command.setChecked(false);
        command.setEnabled(false);

        $("#status-inspection").hide();
        $("#interactive-linter-lint-indicator").show();
    }


    /**
     * Function that enables the native linter indicator when interactive
     * linter is not active.
     */
    function enableBracketsIndicator() {
        var command = CommandManager.get(Commands.VIEW_TOGGLE_INSPECTION);
        command.setChecked(bracketsLinterEnabled);
        command.setEnabled(true);

        $("#status-inspection").show();
        $("#interactive-linter-lint-indicator").hide();
        CodeInspection.toggleEnabled(true, true);
    }


    /**
     * Function that gets called when there is a new document that needs
     * interactive linter registered on.
     */
    function setDocument(event, currentEditor, previousEditor) {
        // Unregister current linter instance
        if (linter) {
            linter.dispose();
            linter = null;
        }

        if (previousEditor) {
            $(previousEditor).off("editorChange", handleDocumentChange);
        }

        if (currentEditor) {
            linter = linterManager.registerDocument(currentEditor._codeMirror, currentEditor.document.file);
        }

        // If a linter was successfully created, then we are safe to bind event handlers for editor changes.
        if (linter) {
            $(currentEditor).on("editorChange", handleDocumentChange);
            linter.lint();
            setTimeout(disableBracketsIndicator);
        }
        else {
            setTimeout(enableBracketsIndicator);
        }
    }


    /**
     * Function that gets called when Brackets is loaded and ready
     */
    function appReady() {
        // Removes the default Brackets JSLint linter
        CodeInspection.register("javascript", {
            name: "interactive-linter-remove-jslint",
            scanFile: $.noop
        });

        // Load up plugins and wait til they are done loading before we
        // register any handlers into Brackets
        pluginManager().done(function(plugins) {
            for (var iPlugin in plugins) {
                linterManager.registerLinter(plugins[iPlugin]);
            }

            $(EditorManager).on("activeEditorChange.interactive-linter", setDocument);
            setDocument(null, EditorManager.getActiveEditor());
        });
    }
});
