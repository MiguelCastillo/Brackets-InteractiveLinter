/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module) {

    var JSLINT = require('jslint/libs/jslint'),
        groomer  = require("jslint/groomer");

    var defaultSettings = {};


    function lint(text, settings) {
        // Make we use some good default settings if none have been specified
        settings = settings || defaultSettings;

        if ( !JSLINT(text, settings) ) {
            var errors = JSLINT.errors.slice(0);

            // If JSHINT.errors is false, then JSHint has some errors it needs to report
            for ( i = 0, length = errors.length; i < length; i++ ) {

                // If an error is empty, it should be the last error in the array which
                // means that the max number of errors was exceeded or there was a fatal
                // error while linting the file
                if ( errors[i] ) {
                    errors[i].token = groomer.groom(errors[i], settings);
                }
            }

            return errors;
        }
    }

    return {
        language: "disabled-javascript",
        lint: lint,

        // Settings
        defaultSettings: defaultSettings,
        settingsFile: ".jslintrc"
    };

});
