/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require /*, exports, module*/) {
    "use strict";

    var _                  = brackets.getModule("thirdparty/lodash"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        preferences        = PreferencesManager.getExtensionPrefs("interactive-linter"),
        linterSettings     = require("linterSettings"),
        linterReporter     = require("linterReporter"),
        linters            = {},
        linterManager      = {};


    preferences.definePreference("json",          "array", ["jsonlint"]);
    preferences.definePreference("jsx",           "array", ["jsx"]);
    preferences.definePreference("coffeescript",  "array", ["coffeelint"]);
    preferences.definePreference("javascript",    "array", ["jshint"]);


    function LintRunner(editor) {
        this.editor   = editor;
        this.reporter = linterReporter();
        this.lint     = _.debounce(LintRunner.lint.bind(null, this, editor.document.file.fullPath), 1000);
    }


    LintRunner.prototype.getLinter = function() {
        var language         = this.editor.document.getLanguage().getId();
        var preferredLinters = preferences.get(language);
        var linterName       = preferredLinters && preferredLinters[0];

//        if (/.ts|.typescript$/.test(file.name) && language === "javascript") {
//            language = "typescript";
//        }
//        else if (/.jsx$/.test(file.name) && language === "javascript") {
//            language = "jsx";
//        }

        return linters[linterName];
    };


    LintRunner.prototype.canProcess = function() {
        return !!this.getLinter();
    };


    LintRunner.prototype.clear = function() {
        this.reporter.clear();
    };


    /**
     * Interface that will be used for running linters
     */
    LintRunner.lint = function(lintRunner, fullPath) {
        var linterPlugin = lintRunner.getLinter();

        if (!linterPlugin) {
            return;
        }

        return linterSettings.loadSettings(linterPlugin.settingsFile, fullPath, lintRunner)
            .always(function(settings) {
                linterPlugin.lint(lintRunner.editor.document.getText(), settings)
                    .done(function(result) {
                        lintRunner.reporter.report(lintRunner.editor._codeMirror, result);
                    });
            });
    };


    /**
     * Interface to register documents that need an instance of the appropriate linter.
     *
     * @param {CodeMirror} cm Is the CodeMirror instance to enable interactive linting on.
     * @param {File} file - Is the file for the document being registered.  This is to
     *  load the most suitable settings file.
     *
     * @returns {Linter} Instance of linter to process the cm document
     */
    function createLintRunner(editor) {
        return new LintRunner(editor);
    }


    function registerLinter(linter) {
        linters[linter.name] = linter;
    }


    linterManager.createLintRunner = createLintRunner;
    linterManager.registerLinter   = registerLinter;
    return linterManager;
});
