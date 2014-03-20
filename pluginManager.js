/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module) {
    'use strict';

    var FileSystem   = brackets.getModule("filesystem/FileSystem");
    var pluginLoader = require("pluginLoader");
    var spromise     = require("libs/js/spromise");
    var defered      = spromise.defer();


    /**
    * pluginManager is the processor for loading up plugins in the plugins directory in
    * make sure they are smoothly running in a worker thread.
    */
    function pluginManager() {
        // Build plugin list that the worker thread needs to load
        getPluginsMeta(module.uri.substring(0, module.uri.lastIndexOf("/")) + "/plugins").done(function(pluginsMeta) {
            pluginLoader(pluginManager, pluginsMeta).always(defered.resolve);
        });
    }


    function getPluginsMeta (path) {
        var result = spromise.defer();

        FileSystem.getDirectoryForPath(path).getContents(function(err, entries) {
            if ( err ) {
                result.reject(err);
            }

            var i, directories = [], files = [], entry;

            for (i = 0; i < entries.length; i++) {
                entry = entries[i];
                if (entry.isDirectory) {
                    directories.push(entry.name);
                }

                if (entry.isFile && entry.name.endsWith(".js")) {
                    files.push(entry.name);
                }
            }

            result.resolve({
                directories: directories,
                files: files,
                path: path
            });
        });

        return result.promise;
    }


    pluginManager();

    return {
        ready: defered.done
    };
});

