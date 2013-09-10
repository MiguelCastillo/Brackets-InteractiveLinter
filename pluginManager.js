/*
 * Copyright (c) 2013 Miguel Castillo.
 *
 * Licensed under MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */


define(function(require, exports, module) {
    'use strict';

    var NativeFileSystem = brackets.getModule("file/NativeFileSystem").NativeFileSystem;
    var lintManager = require("linterManager");
    var pluginRequire = false;

    function loadPlugins (path) {
        var result = $.Deferred();

        function endsWith(_string, suffix) {
            return _string.indexOf(suffix, _string.length - suffix.length) !== -1;
        }

        function handleError(error) {
            result.reject(error);
        }

        // Load up the content of the directory
        function loadDirectoryContent(fs) {
            fs.root.createReader().readEntries(function success(entries) {
                var i, directories = [], files = [];

                for (i = 0; i < entries.length; i++) {
                    if (entries[i].isDirectory) {
                        directories.push(entries[i].name);
                    }

                    if (entries[i].isFile && endsWith(entries[i].name, ".js")) {
                        directories.push(entries[i].name);
                    }
                }

                result.resolve({
                    directories: directories,
                    files: files,
                    path: path
                });
            }, handleError);
        }

        // Get directory reader handle
        NativeFileSystem.requestNativeFileSystem(path, loadDirectoryContent, handleError);
        return result.promise();
    }


    function init() {
        loadPlugins(module.uri.substring(0, module.uri.lastIndexOf("/")) + "/plugins").done(function(plugins) {
            pluginRequire = requirejs.config({
                "baseUrl": plugins.path,
                "packages": plugins.directories
            });

            pluginRequire(plugins.directories, function() {
                var _plugins = Array.prototype.slice.call(arguments);
                for ( var iPlugin in _plugins ) {
                    _plugins[iPlugin].name = _plugins[iPlugin].name || plugins.directories[iPlugin];
                    lintManager.register(_plugins[iPlugin]);
                }
            });
        });
    }


    return {
        init: init
    };

});

