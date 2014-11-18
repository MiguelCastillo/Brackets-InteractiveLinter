/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module) {
    'use strict';

    var FileSystem      = brackets.getModule("filesystem/FileSystem");
    var pluginLoader    = require("pluginLoader");
    var spromise        = require("libs/js/spromise");
    var pluginDirectory = module.uri.substring(0, module.uri.lastIndexOf("/")) + "/plugins";


    /**
     * pluginManager is the processor for loading up plugins in the plugins directory in
     * make sure they are smoothly running in a worker thread.
     */
    function pluginManager() {
        return getPluginsMeta(pluginDirectory).then(pluginLoader.embeddedPluginLoader);
    }


    function getPluginsMeta(path) {
        return spromise(function(resolve, reject) {
            FileSystem.getDirectoryForPath(path).getContents(function(err, entries) {
                var i, length, entry, directories = [];

                if (err) {
                    reject(err);
                    return;
                }

                for (i = 0, length = entries.length; i < length; i++) {
                    entry = entries[i];
                    if (entry.isDirectory) {
                        directories.push(entry.name);
                    }
                }

                resolve({
                    directories: directories,
                    path: path
                });
            });
        });
    }


    return pluginManager;
});

