/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    'use strict';

    // Reference for jshint errors/warnings
    // http://jslinterrors.com/?utm_source=javascriptweekly&utm_medium=email

    var EditorManager    = brackets.getModule("editor/EditorManager"),
        AppInit          = brackets.getModule("utils/AppInit"),
        ExtensionUtils   = brackets.getModule("utils/ExtensionUtils");

    var linterManager = require("linterManager"),
        PluginManager = require("pluginManager");
    require("linterSettings");

    var _pluginManager = new PluginManager();


    ExtensionUtils.loadStyleSheet(module, "style.css");

    function setDocument() {
        var editor = EditorManager.getActiveEditor();
        if (!editor || !editor._codeMirror) {
            linterManager.setDocument(null);
            return;
        }

        linterManager.setDocument(editor._codeMirror, editor.document.file.fullPath);
        linterManager.lint();
    }


    _pluginManager.ready(function(plugins) {
        for ( var iPlugin in plugins ) {
            linterManager.register( plugins[iPlugin] );
        }

        AppInit.appReady(function(){
            $(EditorManager).on("activeEditorChange.interactive-linter", setDocument);
            setDocument();
        });
    });

});

