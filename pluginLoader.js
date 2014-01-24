/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module){

    var Timer = require("timer");

    function pluginLoader(manager, pluginsMeta) {
        var msgId = 1,
            plugins, pending, lastRequest;

        var workerFile = module.uri.substring(0, module.uri.lastIndexOf("/")) + "/pluginWorker.js";

        // Instantiate the worker thread for the linter
        var worker = new Worker(workerFile);

        // Process worker thread messages
        worker.onmessage = function onmessage (evt) {
            var data = evt.data;

            switch (data.type) {
                case "debug":
                    console.log(data);
                    return;
            }

            if ( lastRequest && lastRequest.state() === "pending" ) {
                lastRequest.resolve(data);
            }
        };


        worker.onerror = function onerror (evt) {
            console.log("error", evt);
        };


        function postMessage( data ) {
            pending = msgId;
            if ( lastRequest && lastRequest.state() === "pending" ) {
                return;
            }

            //var timer = new Timer(true);
            lastRequest = $.Deferred();
            data.msgId = msgId;
            worker.postMessage(data);
            msgId++;

            return lastRequest.then(function(response) {
                // If there is data pending, then send it
                if ( pending !== response.msgId ) {
                    console.log("send queued message");
                    data.msgId = msgId;
                    msgId++;
                    worker.postMessage(data);
                }

                //console.log(timer.elapsed(), response.msgId);
                return response.data;
            });
        }


        function loadPlugins(plugins) {
            var plugin;
            for ( var iplugin in plugins ) {
                plugin = plugins[iplugin];

                // Add a lint interface that will be just posting a message to the worker thread
                $.extend(plugin, api(plugin));
            }
            return plugins;
        }


        // Api for plugin linters
        function api( plugin ) {
            function lint( text, settings ) {
                return postMessage({
                    type: "lint",
                    data: {
                        name: plugin.name,
                        text: text,
                        settings: settings
                    }
                }).then(function(response) {
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
                "packages": pluginsMeta.directories,
                "files": pluginsMeta.files
            }
        })
        .then(function(response) {
            plugins = loadPlugins(response);
            return plugins;
        });
    }


    return pluginLoader;

});
