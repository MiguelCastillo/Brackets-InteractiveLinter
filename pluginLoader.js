/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module){
    "use strict";

    var spromise = require("libs/js/spromise"),
        utils    = require("libs/js/utils");


    function embeddedPluginLoader(pluginsMeta) {
        var requirePlugin = requirejs.config({
            "paths": {
                "text": "../libs/js/text",
                "libs": "../libs/js"
            },
            "baseUrl": pluginsMeta.path,
            "packages": pluginsMeta.directories
        });


        // Api for plugin linters
        function api(plugin) {
            var _lint = plugin.lint;

            function lint(text, settings) {
                return spromise.resolve(_lint(text, settings));
            }

            return {
                lint: lint
            };
        }


        return spromise(function(resolve) {
            requirePlugin(pluginsMeta.directories, function() {
                var plugins = {};

                Array.prototype.slice.call(arguments).forEach(function(plugin, index) {
                    plugin.name = pluginsMeta.directories[index];
                    plugins[plugin.name] = plugin;

                    // Add a lint interface that will be just posting a message to the worker thread
                    utils.mixin(plugin, api(plugin));
                });

                resolve(plugins);
           });
        });
    }


    function workerThreadPluginLoader(pluginsMeta) {
        var currentRequest, lastMessage;
        var pendingRequest = spromise.defer();
        var worker = new Worker(module.uri.substring(0, module.uri.lastIndexOf("/")) + "/pluginWorker.js");


        // Process worker thread messages
        worker.onmessage = function onmessage(evt) {
            var data = evt.data;

            if (data.type === "debug") {
                console.log(data);
                return;
            }

            if (currentRequest.state() === "pending") {
                currentRequest.resolve(data);
            }
        };


        worker.onerror = function onerror(evt) {
            console.log("error", evt);
        };


        function postMessage(message) {
            lastMessage = message;

            if (currentRequest && currentRequest.state() === "pending") {
                pendingRequest.resolve(); // Skip whatever is pending and queue another request
                return (pendingRequest = spromise.defer()).then(resolveRequest.bind(null, message));
            }
            else {
                worker.postMessage(message);
                return (currentRequest = spromise.defer()).then(resolveRequest.bind(null, message));
            }
        }


        function resolveRequest(message, response) {
            if (!response) {
                return;
            }

            // If there is data pending, then send it
            if (message !== lastMessage) {
                console.log("send queued message");
                currentRequest = pendingRequest;
                worker.postMessage(message);
            }

            return response.data;
        }


        function loadPlugins(plugins) {
            var plugin;
            for (var iplugin in plugins) {
                plugin = plugins[iplugin];

                // Add a lint interface that will be just posting a message to the worker thread
                utils.mixin(plugin, api(plugin));
            }

            return plugins;
        }


        // Api for plugin linters
        function api(plugin) {
            function lint(text, settings) {
                return postMessage({
                    type: "lint",
                    data: {
                        name: plugin.name,
                        text: stripMinified(text),
                        settings: settings
                    }
                })
                .then(function(response) {
                    return response.result;
                });
            }

            return {
                lint: lint
            };
        }


        // Send request to init
        return postMessage({
            "type": "init",
            "data": {
                "baseUrl": pluginsMeta.path,
                "packages": pluginsMeta.directories
            }
        })
        .then(loadPlugins);
    }


    /**
     * Strips out any line that longer than 250 characters as a way to guess if the code is minified
     */
    function stripMinified(text) {
        // var regex = /function[ ]?\w*\([\w,]*\)\{(?:\S[\s]?){150,}\}/gm;
        // var regex = /(?:\S[\s]?){250,}[\n]$/gm;
        var regex = /(?:.){500,}/gm;
        return text.replace(regex, "");
    }


    return {
        workerThreadPluginLoader: workerThreadPluginLoader,
        embeddedPluginLoader: embeddedPluginLoader
    };
});
