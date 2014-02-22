/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    'use strict';

    var Dialogs         = brackets.getModule("widgets/Dialogs"),
        ProjectManager  = brackets.getModule("project/ProjectManager"),
        FileSystem      = brackets.getModule("filesystem/FileSystem");

    var spromise        = require("libs/js/spromise");

    var currentProject  = {},
        currentSettings = {};


    function getParentPath( path ) {
        var result = stripTrailingSlashes( path );
        return result.substr(0, result.lastIndexOf("/") + 1);
    }


    function findFile( fileName, filePath, traverse ) {
        var deferred = spromise.defer();

        function find( filePath ) {
            if ( !filePath ) {
                return deferred.reject(false);
            }

            try {
                var file = FileSystem.getFileForPath (filePath + "/" + fileName);
                file.exists(function( err, exists ) {
                    if ( exists ) {
                        deferred.resolve(file);
                    }
                    else if ( err || !traverse || filePath.indexOf( currentProject.fullPath ) === -1 ) {
                        deferred.reject(false);
                    }
                    else {
                        find( getParentPath(filePath) );
                    }
                });
            }
            catch(ex) {
                deferred.reject(false);
            }
        }

        find( filePath );
        return deferred.promise;
    }


    function readFile( file ) {
        var deferred = spromise.defer();

        file.read(function( err, content /*, stat*/ ) {
            if ( err ) {
                deferred.reject(err);
                return;
            }

            deferred.resolve(content);
        });

        return deferred.promise;
    }


    function setSettings( settings ) {
        var deferred = spromise.defer();

        try {
            settings = JSON.parse(stripComments(settings));
            deferred.resolve(settings);
        }
        catch( ex ) {
            Dialogs.showModalDialog(
                "interactiveLinterErr",
                "Interactive Linter Error",
                "Error processing linter settings<br>" +
                ex.toString());

            deferred.reject("Error processing linter settings");
        }

        return deferred.promise;
    }


    function loadSettings(linter, path) {
        if ( !linter.settingsFile ) {
            return spromise.resolved();
        }

        // Cache so that we are not loading up the same file when navigating in the same directory...
        if ( path in currentSettings ) {
            return spromise.resolved(currentSettings[path]);
        }

        currentSettings = {};
        path = normalizePath(path);
        linter.settings = linter.defaultSettings || {};
        var traverse = path.indexOf(currentProject.fullPath) !== -1;
        return findFile(linter.settingsFile, path, traverse)
                .then(readFile, $.noop)
                .then(setSettings, $.noop)
                .always(function(settings) {
                    currentSettings[path] = settings;
                });
    }


    /**
    * Make sure we only have forward slashes and we dont have any duplicate slashes
    */
    function normalizePath( path ) {
        return path.replace(/\/+|\\+/g, "/");
    }


    /**
    * Lets get rid of the trailing slash
    */
    function stripTrailingSlashes(path) {
        return path.replace(/\/$/, "");
    }


    /**
     * Strips all commments from a json string.
     */
    function stripComments( text ) {
        var string = text || '';
        string = string.replace(/\/\*(?:[^\*\/])*\*\//g, '');
        string = string.replace(/\/\/.*/g, '');
        return string;
    }


    $(ProjectManager).on("projectOpen", function(e, project) {
        currentProject = project;
    });


    return {
        loadSettings: loadSettings
    };

});
