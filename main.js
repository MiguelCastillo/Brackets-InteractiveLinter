/*
 * Copyright (c) 2013 Miguel Castillo.
 *
 * Licensed under MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports, module) {
    'use strict';

    // Reference for jshint errors/warnings
    // http://jslinterrors.com/?utm_source=javascriptweekly&utm_medium=email

    var EditorManager    = brackets.getModule("editor/EditorManager"),
        AppInit          = brackets.getModule("utils/AppInit"),
        ExtensionUtils   = brackets.getModule("utils/ExtensionUtils"),
        FileUtils        = brackets.getModule("file/FileUtils"),
        NativeFileError  = brackets.getModule("file/NativeFileError"),
        NativeFileSystem = brackets.getModule("file/NativeFileSystem").NativeFileSystem,
        ProjectManager   = brackets.getModule("project/ProjectManager");

    var linterManager         = require('linterManager'),
        linterDefaultSettings = require('linterSettings');

    linterManager.setLinterType( linterManager.linterTypes.jshint );
    //linterManager.setLinterType( linterManager.linterTypes.jslint );

    ExtensionUtils.loadStyleSheet(module, "style.css");


    function setDocument() {
        var editor = EditorManager.getActiveEditor();
        if (!editor || !editor._codeMirror) {
            linterManager.setDocument(null);
            return;
        }

        linterManager.setDocument(editor._codeMirror);
        setTimeout(function() {
            linterManager.run();
        }, 1000);
    }


    function setSettings(settings) {
        linterManager.setSettings(settings || linterDefaultSettings);
    }


    var projectManager = (function(){
        var projectPath;

        // If the file exists, then we load that file up and use it as the settings
        // for JSHint
        function successCallback (fileEntry) {
            FileUtils.readAsText(fileEntry).done(function (text) {
                setSettings(JSON.parse(text));
            });
        }

        // If the jshint file does not exist for the particular project we are
        // loading, we will attempt to create a jshintrc file with the default
        // settings that will be loaded next time this project gets loaded.
        function errorCallback ( err ) {
            // Load up default settings
            setSettings();

            if ( err.name === NativeFileError.NOT_FOUND_ERR ) {
                var directoryEntry = new NativeFileSystem.DirectoryEntry(projectPath);

                // Create jshintrc file
                directoryEntry.getFile( ".interactiveLinter", {
                        create: true,
                        exclusive: true
                    }, function( fileEntry ) {
                        fileEntry.createWriter( function(fileWriter) {
                            fileWriter.write( JSON.stringify(linterDefaultSettings) );
                        });
                    });
            }
        }

        function open(project) {
            // Try to load up the linterSettings file, which is per project.
            projectPath = FileUtils.canonicalizeFolderPath(project.fullPath);
            var jshintFile  = projectPath + "/.interactiveLinter";

            // Start the process of figuring out if we already have a .jshintrc file
            NativeFileSystem.resolveNativeFileSystemPath(jshintFile, successCallback, errorCallback);
        }

        return {
            open: open
        };

    })();


    function ready () {
        $(EditorManager).on("activeEditorChange.interactive-linter", setDocument);
        setDocument();
    }


    $(ProjectManager).on("projectOpen", function(e, project){projectManager.open(project);});
    AppInit.appReady(ready);

});
