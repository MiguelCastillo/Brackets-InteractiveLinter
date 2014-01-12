/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module) {
    'use strict';

    var NativeFileSystem = brackets.getModule("file/NativeFileSystem").NativeFileSystem;


    /**
    * pluginManager is the processor for loading up plugins in the plugins directory in
    * make sure they are smoothly running in a worker thread.
    */
    function pluginManager() {
        if ( this instanceof pluginManager === false ) {
            return new pluginManager();
        }

        var _self = this;

        // Setup a ready callback.  This will also trigger an event, so either way is good
        _self.ready = $.Deferred();

        // Configure the pluginManager intance
        pluginManager.configure.call(this);
    }


    pluginManager.configure = function() {
        var _self = this;
        var pluginsDir = module.uri.substring(0, module.uri.lastIndexOf("/")) + "/plugins",
            workerFile = module.uri.substring(0, module.uri.lastIndexOf("/")) + "/pluginWorker.js";

        // Queue of pending requests
        _self._queue = {};

        // Instantiate the worker thread for the linter
        _self.worker = new Worker(workerFile);

        // Process worker thread messages
        _self.worker.onmessage = function(evt) {
            var data = evt.data;
            var method = (_self.plugins && _self.plugins[data.type]);

            if ( typeof method === 'function' ) {
                return method.apply(_self, [data || {}]);
            }

            switch (data.type) {
                case "ready":
                    _self.plugins = linterPlugins(_self, data.data);
                    _self.ready.resolve(_self.plugins);
                    $(_self).trigger("ready", [_self.plugins]);
                    break;
                case "lint":
                    _self._queue[data.msgId].resolve(data.data.result);
                    delete _self._queue[data.msgId];
                    break;
                case "debug":
                    console.log(data);
                    break;
                default:
                    throw new Error("Unknown message type: " + data.type);
            }
        };

        _self.worker.onerror = function(evt) {
            console.log("error", evt);
        };


        // Build plugin list that the worker thread needs to load
        buildPluginList(pluginsDir).done(function(plugins) {
            _self.worker.postMessage({
                "type": "init",
                "data": {
                    "baseUrl": plugins.path,
                    "packages": plugins.directories,
                    "files": plugins.files
                }
            });
        });
    };


    function linterPlugins(manager, plugins) {
        var plugin, msgId = 0;

        function lint( plugin ) {
            return function( text, settings ) {
                var id = msgId++;
                manager._queue[id] = $.Deferred();

                manager.worker.postMessage({
                    type: "lint",
                    msgId: id,
                    data: {
                        name: plugin.name,
                        text: text,
                        settings: settings
                    }
                });

                return manager._queue[id].promise();
            };
        }


        for ( var iPlugin in plugins ) {
            plugin = plugins[iPlugin];

            // Add a lint interface that will be just posting a message to the worker thread
            plugin.lint = lint(plugin);
        }

        return plugins;
    }


    function buildPluginList (path) {
        var promise = $.Deferred();

        function endsWith(_string, suffix) {
            return _string.indexOf(suffix, _string.length - suffix.length) !== -1;
        }

        function handleSuccess( entries ) {
            var i, directories = [], files = [];

            for (i = 0; i < entries.length; i++) {
                if (entries[i].isDirectory) {
                    directories.push(entries[i].name);
                }

                if (entries[i].isFile && endsWith(entries[i].name, ".js")) {
                    files.push(entries[i].name);
                }
            }

            promise.resolve({
                directories: directories,
                files: files,
                path: path
            });
        }

        function handleError(error) {
            promise.reject(error);
        }

        // Load up the content of the directory
        function loadDirectoryContent(fs) {
            fs.root.createReader().readEntries(handleSuccess, handleError);
        }

        // Get directory reader handle
        NativeFileSystem.requestNativeFileSystem(path, loadDirectoryContent, handleError);
        return promise.promise();
    }


    return pluginManager;
});

