/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */

define(function(require /*, exports, module*/) {
    "use strict";

    var utils          = require("libs/utils");
    var jshint         = require("../jshint/main");
    var reacttools     = require("jsx/libs/reacttools");
    var defaultOptions = JSON.parse(require("text!jsx/default.json"));
    var settings       = JSON.parse(require("text!jsx/settings.json"));


    function lint(source, options) {
        options = utils.mixin({}, defaultOptions, options);
        var result;

        try {
            result = reacttools.transform(source);
        }
        catch(ex) {
            return [{
                type: "error",
                reason: ex.description,
                token:{
                    start: {
                        line: ex.lineNumber - 1,
                        ch: ex.column ? ex.column - 1 : ex.column
                    },
                    end: {
                        line: ex.lineNumber - 1,
                        ch: ex.column
                    }
                }
            }];
        }

        return jshint.lint(result, options);
    }


    return utils.mixin(settings, {
        lint: lint
    });
});
