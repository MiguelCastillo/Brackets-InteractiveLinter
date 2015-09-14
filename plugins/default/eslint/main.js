/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */

//http://eslint.org/demo/
define(function(require /*, exports, module*/) {
    "use strict";

    var belty          = require("libs/belty");
    var groomer        = require("eslint/groomer");
    var eslint         = require("eslint/libs/eslint");
    var defaultOptions = JSON.parse(require("text!eslint/default.json"));
    var settings       = JSON.parse(require("text!eslint/settings.json"));

    function lint(source, options) {
        options = belty.extend({}, defaultOptions, options);
        var results = [], i, length;

        try {
            results = eslint.verify(source, options);
        }
        catch(ex) {
            console.log(ex.message);
        }

        for (i = 0, length = results.length; i < length; i++) {
            groomer.groom(results[i], options);
        }

        return results;
    }

    return belty.extend(settings, {
        lint: lint
    });
});
