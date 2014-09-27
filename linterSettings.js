/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require/*, exports, module*/) {
    'use strict';

    var Dialogs         = brackets.getModule("widgets/Dialogs"),
        ProjectManager  = brackets.getModule("project/ProjectManager"),
        FileSystem      = brackets.getModule("filesystem/FileSystem"),
        spromise        = require("libs/js/spromise"),
        currentProject  = {},
        currentLinter   = {};


    function getParentPath(path) {
        var result = stripTrailingSlashes(path);
        return result.substr(0, result.lastIndexOf("/") + 1);
    }


    function findFile(fileName, filePath, traverse) {
        var deferred = spromise.defer();

        function find(filePath) {
            if (!filePath) {
                return deferred.reject(false);
            }

            try {
                var file = FileSystem.getFileForPath(filePath + "/" + fileName);
                file.exists(function(err, exists) {
                    if (exists) {
                        deferred.resolve(file);
                    }
                    else if (err || !traverse || filePath.indexOf(currentProject.fullPath) === -1) {
                        deferred.reject(false);
                    }
                    else {
                        find(getParentPath(filePath));
                    }
                });
            }
            catch(ex) {
                deferred.reject(false);
            }
        }

        find(filePath);
        return deferred.promise;
    }


    function readFile(file) {
        var deferred = spromise.defer();

        file.read(function(err, content /*, stat*/) {
            if (err) {
                deferred.reject(err);
                return;
            }

            deferred.resolve(content);
        });

        return deferred.promise;
    }


    function setSettings(settings) {
        var deferred = spromise.defer();
        settings = stripComments(settings);

        try {
            settings = JSON.parse(settings);
            deferred.resolve(settings);
        }
        catch(ex) {
            if (!settings) {
                deferred.resolve();
                return;
            }

            Dialogs.showModalDialog(
                "interactiveLinterErr",
                "Interactive Linter Error",
                "Error processing linter settings<br>" +
                ex.toString()
            );

            deferred.reject("Error processing linter settings");
        }

        return deferred.promise;
    }


    FileSystem.on("change", function(evt, file) {
        if (currentLinter.file && currentLinter.fileObject && file && file.fullPath === currentLinter.fileObject.fullPath) {
            loadFile().done(currentLinter.linter.lint);
        }
    });


    function loadFile() {
        var traverse = currentLinter.path.indexOf(currentProject.fullPath) !== -1;

        return findFile(currentLinter.file, currentLinter.path, traverse)
            .always(function(file) {
                currentLinter.fileObject = file;
            })
            .then(readFile, $.noop)
            .then(setSettings, $.noop)
            .always(function(settings) {
                currentLinter.settings = settings;
            });
    }


    function loadSettings(file, path, linter) {
        if (!file) {
            return spromise.resolved();
        }

        // Cache so that we are not loading up the same file when navigating in the same directory...
        if (path === currentLinter.path) {
            return spromise.resolved(currentLinter.settings);
        }

        currentLinter = {
            path: normalizePath(path),
            file: file,
            linter: linter
        };

        return loadFile();
    }


    /**
    * Make sure we only have forward slashes and we dont have any duplicate slashes
    */
    function normalizePath(path) {
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
    function stripComments(text) {
        // Regex from requirejs.  Thanks James!
        return  (text || "").replace(/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, '');
    }


    $(ProjectManager).on("projectOpen", function(e, project) {
        currentProject = project;
    });


    return {
        loadSettings: loadSettings
    };

});
