/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module) {
    "use strict";

    var _          = brackets.getModule("thirdparty/lodash"),
        Promise    = require("libs/js/spromise"),
        Linter     = require("Linter"),
        requireUID = 1;


    function linterFacrory(name, lint, options) {
        function LinterPlugin() {Linter.call(this, options);}
        LinterPlugin.prototype = Object.create(Linter.prototype);
        LinterPlugin.prototype.constructor = LinterPlugin;
        LinterPlugin.prototype.lint = lint;

        return $.extend({}, options, {
            create: function() {
                return new LinterPlugin();
            }
        });
    }


    /**
     * Plugin loader that runs plugin in the same thread
     */
    function embeddedPluginLoader(pluginsMeta) {
        if (!pluginsMeta.directories.length) {
            return Promise.resolve();
        }

        var requirePlugin = requirejs.config({
            "context": "interactive-linter-plugins-" + (requireUID++),
            "paths": {
                "text": "../../libs/js/text",
                "libs": "../../libs/js"
            },
            "baseUrl": pluginsMeta.path,
            "packages": pluginsMeta.directories
        });


        function lintWrapper(plugin) {
            return function lintDelegate(lintData, settings) {
                return Promise.resolve(plugin.lint(lintData.content, settings));
            };
        }


        return new Promise(function(resolve) {
            requirePlugin(pluginsMeta.directories, function() {
                var plugins = {};

                _.toArray(arguments).forEach(function(plugin, index) {
                    var name = pluginsMeta.directories[index];
                    plugins[name] = linterFacrory(name, lintWrapper(plugin), plugin);
                });

                resolve(plugins);
           });
        });
    }


    /**
     * Plugin loader that runs plugins in a web worker.
     */
    function workerThreadPluginLoader(pluginsMeta) {
        if (!pluginsMeta.directories.length) {
            return Promise.resolve();
        }

        var currentRequest, lastMessage;
        var pendingRequest = Promise.defer();
        var workerFile     = module.uri.substring(0, module.uri.lastIndexOf("/")) + "/pluginWorker.js";
        var worker         = new Worker(workerFile);


        // Process worker thread messages
        worker.onmessage = function onmessage(evt) {
            var message = evt.data;
            if (message.type === "debug") {
                console.log(message.data);
                return;
            }

            if (currentRequest.state() === "pending") {
                currentRequest.resolve(message);
            }
        };


        worker.onerror = function onerror(evt) {
            console.error("error", evt);
        };


        function postMessage(message) {
            lastMessage = message;

            if (currentRequest && currentRequest.isPending()) {
                pendingRequest.resolve(); // Skip whatever is pending and queue another request
                return (pendingRequest = Promise.defer()).then(resolveRequest.bind(null, message));
            }
            else {
                worker.postMessage(message);
                return (currentRequest = Promise.defer()).then(resolveRequest.bind(null, message));
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
                plugins[iplugin] = linterFacrory(iplugin, lintWrapper(plugin), plugin);
            }
            return plugins;
        }


        // Api for plugin linters
        function lintWrapper(plugin) {
            return function lintDelegate(lintData, settings) {
                return postMessage({
                        type: "lint",
                        data: {
                            name: plugin.name,
                            data: lintData,
                            settings: settings || {}
                        }
                    });
            };
        }


        var initMessage = {
            type: "init",
            data: {
                baseUrl: pluginsMeta.path,
                packages: pluginsMeta.directories
            }
        };


        // Send request to init
        return postMessage(initMessage).then(loadPlugins);
    }


    return {
        workerThreadPluginLoader: workerThreadPluginLoader,
        embeddedPluginLoader: embeddedPluginLoader
    };
});
