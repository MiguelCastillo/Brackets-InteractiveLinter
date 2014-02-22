/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    'use strict';

    var linterSettings = require("linterSettings"),
        linterReporter = require("linterReporter");

    var languages = {},
        linters = {};

    var linterManager = (function() {
        var _cm       = null,
            _timer    = null,
            _mode     = "",
            _fullPath = "";

        function lint( ) {
            if ( !_cm || !languages[_mode] ) {
                return;
            }

            if (_timer) {
                clearTimeout(_timer);
                _timer = null;
            }

            _timer = setTimeout(function () {
                _timer = null;
                linterSettings.loadSettings(languages[_mode], _fullPath).always(function(settings) {
                    languages[_mode].lint(_cm.getDoc().getValue(), settings || {}).done(function(result) {
                        linterReporter.report(_cm, result);
                    });
                });
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
        function setDocument(cm, fullpath) {
            var gutters, index;
            var mode  = cm && cm.getDoc().getMode();
            _mode     = mode && (mode.helperType || mode.name);
            _fullPath = fullpath;

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

            if (cm && languages[_mode]) {
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
        }


        return {
            lint: lint,
            register: register,
            setDocument: setDocument
        };

    })();


    return linterManager;

});

