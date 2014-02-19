/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    'use strict';

    var linterSettings = require("linterSettings");
    var linterReporter  = require("linterReporter");
    var ProjectFiles    = require('ProjectFiles');

    var languages = {};
    var linters = {};
    var currentProject;

    var linterManager = (function() {
        var _cm = null,
            _timer = null,
            _mode = '';


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
                languages[_mode].lint(_cm.getDoc().getValue(), languages[_mode].settings).done(function(result) {
                    linterReporter.report(_cm, result);
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
        function setDocument(cm) {
            var gutters, index;
            var mode = cm && cm.getDoc().getMode();
            _mode = mode && (mode.helperType || mode.name);

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


        $(ProjectFiles).on("projectOpen", function(evt, project) {
            currentProject = project;
        });


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

