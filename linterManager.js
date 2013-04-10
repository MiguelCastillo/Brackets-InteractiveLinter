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

/*jslint plusplus: true, nomen: true, regexp: true, maxerr: 50 */

define(function (require, exports, module) {
    'use strict';

    var linterReporter = require('linterReporter'),
        linterSettings = require('linterSettings'),
        jshintGroomer = require('jshintGroomer'),
        jslintGroomer = require('jslintGroomer');

    // Running a modified version of jshint to fix the issue with unused function parameters.
    /**
    * BUG: jshint gives the wrong character index when dealing with tabs.
    * https://github.com/jshint/jshint/issues/430
    * I am stuck only expecting correct results when the files uses white
    * spaces. Arrrggh!
    */
    require('lib/jshint-1.1.0-stable-mod');
    var JSLINT = require('lib/jslint');

    var linterTypes = {
        jshint: 0,
        jslint: 1
    };

    var linterType = linterTypes.jshint;


    var linterManager = (function(){
        var _cm = null, _timer = null;

        function run() {
            if (!_cm) {
                return;
            }

            // Get document as a string to be passed into JSHint
            var docValue = _cm.getDoc().getValue(), jshintSettings = linterSettings.jshint;
            var result;

            // Run JSHint
            if ( linterType === linterTypes.jshint ){
                result = JSHINT(docValue, jshintSettings, jshintSettings.globals);

                // If result is false, then JSHint has some errors it needs to report
                if (result === false) {
                    linterReporter.report(_cm, JSHINT.errors, {
                        // Groom is a callback from the reporter to give a chance at
                        // massaging the message and return a CodeMirror token.
                        groom: function(message) {
                            return jshintGroomer.groom(message, jshintSettings);
                        }
                    });
                }
            }
            else if ( linterType === linterTypes.jslint ) {
                // Run JSLint
                result = JSLINT(docValue, jshintSettings.jslint);

                if (result === false){
                    linterReporter.report(_cm, JSLINT.errors, {
                        // Groom is a callback from the reporter to give a chance at
                        // massaging the message and return a CodeMirror token.
                        groom: function(message) {
                            return jslintGroomer.groom(message, docValue);
                        }
                    });
                }
            }
        }


        function trackChanges() {
            if (_timer) {
                clearTimeout(_timer);
                _timer = null;
            }

            _timer = setTimeout(function () {
                _timer = null;
                run();
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
        * Change which linter type to run
        */
        function setLinterType(type) {
            linterType = type;
        }


        /**
        * We will only handle one document at a time
        */
        function setDocument(cm) {
            if (_cm) {
                CodeMirror.off(_cm.getDoc(), "change", trackChanges);
                _cm.setOption("gutters", []);
                _cm.off('gutterClick', gutterClick);
            }

            if (cm && cm.getDoc().getMode().name === 'javascript') {
                CodeMirror.on(cm.getDoc(), "change", trackChanges);
                _cm = cm;
                _cm.setOption("gutters", ["interactive-linter-gutter"]);
                _cm.on('gutterClick', gutterClick);
            }
        }


        function setSettings(settings) {
            linterSettings = settings;
        }


        return {
            setLinterType: setLinterType,
            setDocument: setDocument,
            setSettings: setSettings,
            linterTypes: linterTypes,
            run: run
        };

    })();


    return linterManager;
});

