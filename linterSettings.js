/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


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
            fileReader.read().done(function (text) {
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

            /*
            * Disable writing linter settings file...
            *
            ProjectFiles.openFile( linter.settingsFile, "write", true ).done(function( fileWriter ) {
                fileWriter.write( JSON.stringify( linter.defaultSettings ) );
            });
            */
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
