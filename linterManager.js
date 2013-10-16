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


define(function (require, exports, module) {
    'use strict';

    var linterSettings = require("linterSettings");
    var linterReporter = require("linterReporter");
    var fileIO         = require("fileIO");


    var languages = {};
    var _cm = null, _timer = null, _mode = '', _localSettings = false;


    function lint( ) {
        if (_timer) {
            clearTimeout(_timer);
            _timer = null;
        }

        if ( !_cm || !languages[_mode] ) {
            return;   
        }

        _timer = setTimeout(function () {
            _timer = null;
            var result = languages[_mode].lint(_cm.getDoc().getValue(), _localSettings || languages[_mode].settings);

            if ( result ) {
                linterReporter.report(_cm, result, languages[_mode].groomer);
            }
        }, 1000);
    }


    /**
    * Show line details
    */
    function gutterClick(cm, lineIndex, gutterId, event) {
        if (gutterId !== "interactive-linter-gutter"){
            return;
        }

        linterReporter.showLineDetails(cm, lineIndex, gutterId, event);
    }


    /**
    * We will only handle one document at a time
    */
    function setDocument(cm, fullPath) {
        console.log(fullPath);
        var gutters, index;
        _mode = cm && cm.getDoc().getMode().name;

        // CodeMirror treats json as javascript, so we gotta do
        // an extra check just to make we are not feeding json
        // into jshint/jslint.  Let's leave that to json linters
        if ( cm && cm.getDoc().getMode().jsonMode ) {
            _mode = "json";   
        }

        // Unhook the current instance of code mirror before hooking
        // up the new one.
        if (_cm) {
            CodeMirror.off(_cm.getDoc(), "change", lint);
            _cm.off('gutterClick', gutterClick);

            gutters = _cm.getOption("gutters").slice(0);
            index = gutters.indexOf("interactive-linter-gutter");
            if ( index !== -1 ) {
                gutters.splice(index, 1);
                _cm.setOption("gutters", gutters);
            }
        }

        // Setup the new instance of code mirror
        _cm = cm;
        if (_cm && languages[_mode]) {
            CodeMirror.on(_cm.getDoc(), "change", lint);
            _cm.on('gutterClick', gutterClick);

            gutters = _cm.getOption("gutters").slice(0);
            if ( gutters.indexOf("interactive-linter-gutter") === -1 ) {
                gutters.unshift("interactive-linter-gutter");
                cm.setOption("gutters", gutters);
            }

            var fileInfo = fileIO.fileInfo(fullPath);
            fileIO.open(fileInfo.path + '/' + languages[_mode].settingsFile)
                .done(function(fileReader){
                    fileReader.readAsText()
                        .done(function(text) {
                            _localSettings = JSON.parse(text);
                        })
                        .fail(function(){
                            _localSettings = false;
                        });
                })
                .fail(function() {
                    _localSettings = false;
                });
        }
    }


    function register( linter ) {
        languages[linter.language] = linter;
        linterSettings.register(linter);
    }


    return {
        // Functions
        lint: lint,
        register: register,
        setDocument: setDocument
    };

});

