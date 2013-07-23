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

    var linterManager   = require('linterManager'),
        defaultSettings = require('defaultSettings'),
        ProjectFiles    = require('ProjectFiles');

    var linterInfo = {
        "jshint": {
            configFile: ".jshintrc",
            defaultSettings: defaultSettings.jshint
        },
        "jslint": {
            configFile: ".jslintrc",
            defaultSettings: defaultSettings.jslint
        }
    };

    //linterManager.setType( linterManager.types.jshint );
    //linterManager.setType( linterManager.types.jslint );

    function getLinterInfo () {
        var info = linterInfo[linterManager.getType()];
        if (!info){
            throw "Unknown linter type";
        }
        return info;
    }


    function setSettings(settings) {
        linterManager.setSettings(settings);
    }


    $(ProjectFiles).on('projectOpen', function() {
        var info = getLinterInfo();
        setSettings(info.defaultSettings);

        ProjectFiles.openFile( info.configFile )
        .done(function( fileReader ) {
            fileReader.readAsText().done(function (text) {
                try {
                    setSettings( JSON.parse(text) );
                }
                catch( ex ) {
                    Dialogs.showModalDialog(
                        "interactiveLinterErr",
                        "Interactive Linter Error",
                        "Error processing jshint settings<br>" +
                        ex.toString());
                }
            });
        })
        .fail(function(err){
            if( err.name !== NativeFileError.NOT_FOUND_ERR ) {
                return;
            }

            ProjectFiles.openFile( info.configFile, "write", true ).done(function( fileWriter ) {
                fileWriter.write( JSON.stringify( info.defaultSettings ) );
            });
        });
    });

});
