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

/*jslint plusplus: true, nomen: true, regexp: true, maxerr: 50 */

define(function (require, exports, module) {
    'use strict';

    var FileUtils        = brackets.getModule("file/FileUtils"),
        NativeFileError  = brackets.getModule("file/NativeFileError"),
        NativeFileSystem = brackets.getModule("file/NativeFileSystem").NativeFileSystem,
        ProjectManager   = brackets.getModule("project/ProjectManager");

    var jshintReporter = require('jshintReporter'), jshintSettings = {};

    // Running a modified version of jshint to fix the issue with unused function parameters.
    require('jshint-1.1.0-stable-mod');

    //
    //  This logc below is to load up per project settings for jshint.
    //
    $(ProjectManager).on("projectOpen", function openProject(event, project) {

        // Try to load up the jshintrc file that JSHint will use.  This file
        // is per project.
        var projectPath = FileUtils.canonicalizeFolderPath(project.fullPath),
            jshintFile = projectPath + "/.jshintrc";

        // Load default settings everytime we load up a project so that if a
        // project does not have a jshintrc file, we can create one with all
        // default settings
        jshintSettings = require('jshintrc');

        // If the file exists, then we load that file up and use it as the settings
        // for JSHint
        function successCallback (fileEntry) {
            FileUtils.readAsText(fileEntry).done(function (text) {
                jshintSettings = JSON.parse(text);
            });
        }

        // If the jshint file does not exist for the particular project we are
        // loading, we will attempt to create a jshintrc file with the default
        // settings that will be loaded next time this project gets loaded.
        function errorCallback( err ) {
            if ( err.name === NativeFileError.NOT_FOUND_ERR ) {
                var directoryEntry = new NativeFileSystem.DirectoryEntry(projectPath);

                // Create jshintrc file
                directoryEntry.getFile( ".jshintrc", {
                        create: true,
                        exclusive: true
                    }, function( fileEntry ) {
                        fileEntry.createWriter( function(fileWriter){
                            fileWriter.write( JSON.stringify(jshintSettings) );
                        });
                    });
            }
        }

        NativeFileSystem.resolveNativeFileSystemPath(jshintFile, successCallback, errorCallback);
    });


    /**
    * BUG: jshint gives the wrong character index when dealing with tabs.
    * https://github.com/jshint/jshint/issues/430
    * I am stuck only expecting correct results when the files uses white
    * spaces. Arrrggh!
    */
    var jshintManager = (function(){
        var _cm = null, _timer = null;

        function run() {
            if (!_cm) {
                return;
            }

            // Get document as a string to be passed into JSHint
            var docValue = _cm.getDoc().getValue();

            // I could let JSHint pick up .jshintrc, but since I am already reading it
            // I am just going to feed that data directly into JSHint.
            var result = JSHINT(docValue, jshintSettings, jshintSettings.globals);

            // If result is false, then JSHint has some errors it needs to report
            if (result === false) {
                jshintReporter.report(_cm, JSHINT.errors, jshintSettings);
            }
        }


        function trackChanges() {
            if (_timer) {
                clearTimeout(_timer);
                _timer = null;
            }

            _timer = setTimeout(function () {
                _timer = null;
                run();
            }, 1000);
        }


        /**
        * Show line details
        */
        function gutterClick(cm, lineIndex, gutterId, event) {
            if (gutterId !== "interactive-jshint-gutter"){
                return;
            }

            jshintReporter.showLineDetails(cm, lineIndex, gutterId, event);
        }


        /**
        * We will only handle one document at a time
        */
        function registerDocument(cm) {
            if (_cm) {
                CodeMirror.off(_cm.getDoc(), "change", trackChanges);
                _cm.setOption("gutters", []);
                _cm.off('gutterClick', gutterClick);
            }

            if (cm && cm.getDoc().getMode().name === 'javascript') {
                CodeMirror.on(cm.getDoc(), "change", trackChanges);
                _cm = cm;
                _cm.setOption("gutters", ["interactive-jshint-gutter"]);
                _cm.on('gutterClick', gutterClick);
            }
        }


        return {
            registerDocument: registerDocument,
            run: run
        };

    })();


    return jshintManager;
});

