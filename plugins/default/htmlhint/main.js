/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */

define(function(require) {
    "use strict";

    var utils          = require("libs/utils");
    var groomer        = require("htmlhint/groomer");
    var defaultOptions = JSON.parse(require("text!htmlhint/default.json"));
    var settings       = JSON.parse(require("text!htmlhint/settings.json"));

    require("htmlhint/libs/htmlhint");

    function lint(text, options) {
        options = utils.mixin({}, defaultOptions, options);
        var results = HTMLHint.verify(text, options);

        var length = results.length;
        if (length == 0) {
            return;
        }
        var i;
        for (i = 0; i < length; i++) {
            groomer.groom(results[i]);
        }

        return results;
    }

    return utils.mixin(settings, {
        lint: lint
    });
});
