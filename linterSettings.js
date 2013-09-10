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

    var NativeFileError = brackets.getModule("file/NativeFileError"),
        Dialogs         = brackets.getModule("widgets/Dialogs");

    var ProjectFiles    = require('ProjectFiles');
    var linters = {};


    function loadProjectSettings(linter) {
        linter.settings = linter.defaultSettings || {};
        if ( !linter.settingsFile ) {
            return;
        }

        ProjectFiles.openFile( linter.settingsFile )
        .done(function( fileReader ) {
            fileReader.readAsText().done(function (text) {
                try {
                    linter.settings = JSON.parse(text);
                }
                catch( ex ) {
                    Dialogs.showModalDialog(
                        "interactiveLinterErr",
                        "Interactive Linter Error",
                        "Error processing linter settings<br>" +
                        ex.toString());
                }
            });
        })
        .fail(function(err){
            if( err.name !== NativeFileError.NOT_FOUND_ERR ) {
                return;
            }

            ProjectFiles.openFile( linter.settingsFile, "write", true ).done(function( fileWriter ) {
                fileWriter.write( JSON.stringify( linter.defaultSettings ) );
            });
        });
    }


    $(ProjectFiles).on('projectOpen', function(evt, project) {
        for ( var iLinter in linters ) {
            if ( linters.hasOwnProperty(iLinter) ) {
                loadProjectSettings(linters[iLinter]);
            }
        }
    });


    function register( linter ) {
        linters[linter.name] = linter;
        loadProjectSettings( linter );
    }


    return {
        register: register
    };

});
