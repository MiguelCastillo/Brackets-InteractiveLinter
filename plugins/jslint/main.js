/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require /*, exports, module*/) {

    var JSLINT          = require('jslint/libs/jslint'),
        utils           = require("libs/utils"),
        groomer         = require("jslint/groomer"),
        defaultSettings = JSON.parse(require("text!jslint/default.json")),
        settings        = JSON.parse(require("text!jslint/settings.json"));

    function lint(text, settings) {
        var i, length;

        settings = utils.mixin(defaultSettings, settings);

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

    return utils.mixin(settings, {
        lint: lint
    });
});
