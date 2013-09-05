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
    var linterReporter  = require("linterReporter");
    var languages = {};
    var linters = {};

    var linterManager = (function() {
        var _cm = null, _timer = null,
            _mode = '';


        function lint( ) {
            if (_timer) {
                clearTimeout(_timer);
                _timer = null;
            }

            _timer = setTimeout(function () {
                _timer = null;

                if (_cm && languages[_mode]) {
                    languages[_mode].lint(_cm, languages[_mode].settings);
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
        function setDocument(cm) {
            var gutters, index;
            _mode = cm && cm.getDoc().getMode().name;

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

            if (cm && (_mode === 'javascript' || _mode =='coffeescript')) {
                CodeMirror.on(cm.getDoc(), "change", lint);
                _cm = cm;
                _cm.on('gutterClick', gutterClick);

                gutters = _cm.getOption("gutters").slice(0);
                if ( gutters.indexOf("interactive-linter-gutter") === -1 ) {
                    gutters.unshift("interactive-linter-gutter");
                    cm.setOption("gutters", gutters);
                }
            }
        }


        function register( linter ) {
            languages[linter.language] = linter;
            linters[linter.name] = linter;
            linterSettings.register(linter);
        }


        return {
            // Functions
            lint: lint,
            register: register,
            setDocument: setDocument
        };

    })();


    return linterManager;

});

