/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


importScripts("libs/js/require.js");


function PluginLoader(settings) {
    var _self = this;
    this.byName = {};

    var pluginRequire = requirejs.config({
        "paths": {
            "text": "../../libs/js/text",
            "libs": "../../libs/js"
        },
        "baseUrl": settings.baseUrl,
        "packages": settings.packages
    });


    pluginRequire(settings.packages, function() {
        var _plugins = Array.prototype.slice.call(arguments),
            _result = {},
            plugin = null;

        for (var iPlugin in _plugins) {
            plugin      = _plugins[iPlugin];
            plugin.name = plugin.name || settings.packages[iPlugin];
            _self.byName[plugin.name] = plugin;

            _result[plugin.name] = {
                "name"         : plugin.name,
                "language"     : plugin.language,
                "settingsFile" : plugin.settingsFile
            };
        }

        postMessage({
            type: "ready",
            data: _result
        });
    });
}


PluginLoader.prototype.lint = function(linter) {
    var lintResult = this.byName[linter.name].lint(linter.data, linter.settings);

    postMessage({
        type: "lint",
        data: linter.data
    });
};


/**
 * Only used for debugging purposes.
 */
var console = {
    log: function(message) {
        postMessage({
            type: "debug",
            data: message
        });
    }
};


onmessage = function(evt) {
    debugger;
    var message = evt.data;
    var method  = PluginLoader.instance && PluginLoader.instance[message.type];

    if (typeof(method) === 'function') {
        return method.call(PluginLoader.instance, message.data || {});
    }

    switch (message.type) {
        case "init":
            PluginLoader.instance = new PluginLoader(message.data);
            break;
        default:
            throw new Error("Unknown message type: " + message.type);
    }
};

