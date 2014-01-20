/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module) {
    'use strict';

    var FileSystem = brackets.getModule("filesystem/FileSystem");
    var pluginLoader = require("pluginLoader");


    /**
    * pluginManager is the processor for loading up plugins in the plugins directory in
    * make sure they are smoothly running in a worker thread.
    */
    function pluginManager() {
        if ( this instanceof pluginManager === false ) {
            return new pluginManager();
        }

        // Quick reference to this
        var _self = this,
            defered = $.Deferred();

        // Setup a ready callback.  This will also trigger an event, so either way is good
        _self.ready = defered.done;

        // Build plugin list that the worker thread needs to load
        getPluginsMeta(module.uri.substring(0, module.uri.lastIndexOf("/")) + "/plugins").done(function(pluginsMeta) {
            pluginLoader(_self, pluginsMeta).done(defered.resolve);
        });
    }


    function getPluginsMeta (path) {
        var result = $.Deferred();

        function endsWith(_string, suffix) {
            return _string.indexOf(suffix, _string.length - suffix.length) !== -1;
        }

        FileSystem.getDirectoryForPath(path).getContents(function(err, entries) {
            if ( err ) {
                result.reject(err);
            }

            var i, directories = [], files = [];

            for (i = 0; i < entries.length; i++) {
                if (entries[i].isDirectory) {
                    directories.push(entries[i].name);
                }

                if (entries[i].isFile && endsWith(entries[i].name, ".js")) {
                    files.push(entries[i].name);
                }
            }

            result.resolve({
                directories: directories,
                files: files,
                path: path
            });
        });

        return result.promise();
    }


    return pluginManager;
});

