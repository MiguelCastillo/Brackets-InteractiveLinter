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

    var linterReporter = require('linterReporter'),
        jshintGroomer  = require('jshintGroomer'),
        jslintGroomer  = require('jslintGroomer');

    /**
    * BUG: jshint gives the wrong character index when dealing with tabs.
    * https://github.com/jshint/jshint/issues/430
    * I am stuck only expecting correct results when the files uses white
    * spaces. Arrrggh!
    */

    // Running a modified version of jshint to fix the issue with unused function parameters.
    require('lib/jshint-2.0.1');
    var JSLINT = require('lib/jslint');


    var types = {
        "jshint": "jshint",
        "jslint": "jslint"
    };


    var linters = {
        "jshint": {
            lint: function(cm, settings) {
                // Get document as a string to be passed into JSHint
                var docValue = cm.getDoc().getValue();
                var result = JSHINT(docValue, settings, settings.globals);

                // If result is false, then JSHint has some errors it needs to report
                if (result === false) {
                    linterReporter.report(cm, JSHINT.errors, {
                        // Groom is a callback from the reporter to give a chance at
                        // massaging the message and return a CodeMirror token.
                        groom: function(message) {
                            return jshintGroomer.groom(message, settings);
                        }
                    });
                }
            }
        },
        "jslint": {
            lint: function(cm, settings) {
                // Get document as a string to be passed into JSHint
                var docValue = cm.getDoc().getValue();
                var result = JSLINT(docValue, settings);

                if (result === false){
                    linterReporter.report(cm, JSLINT.errors, {
                        // Groom is a callback from the reporter to give a chance at
                        // massaging the message and return a CodeMirror token.
                        groom: function(message) {
                            return jslintGroomer.groom(message, docValue);
                        }
                    });
                }
            }
        }
    };


    var linterManager = (function() {
        var _cm = null, _timer = null,
            _type = types.jshint,
            _settings = {},
            _linter = linters[_type];


        function lint( ) {
            if (_timer) {
                clearTimeout(_timer);
                _timer = null;
            }

            _timer = setTimeout(function () {
                _timer = null;

                if (_cm) {
                    _linter.lint(_cm, _settings);
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

            if (cm && cm.getDoc().getMode().name === 'javascript') {
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


        function setType(type) {
            if (types.hasOwnProperty(type)) {
                _type = type;
                _linter = linters[_type];
            }
        }


        function getType() {
            return _type;
        }


        function setSettings(settings) {
            _settings = settings;
        }


        return {
            // Properties
            types: types,

            // Functions
            lint: lint,
            setType: setType,
            getType: getType,
            setDocument: setDocument,
            setSettings: setSettings
        };

    })();


    return linterManager;

});

