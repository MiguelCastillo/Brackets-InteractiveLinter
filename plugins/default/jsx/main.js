/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require /*, exports, module*/) {
    "use strict";

    var utils          = require("libs/utils"),
        reacttools     = require("jsx/libs/reacttools"),
        defaultOptions = JSON.parse(require("text!jsx/default.json")),
        settings       = JSON.parse(require("text!jsx/settings.json"));


    function lint(data, options) {
        options = utils.mixin({}, defaultOptions, options);

        try {
            data.content = reacttools.transform(data.content);
        }
        catch(ex) {
            data.content = '';
            data.result = [{
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
    }


    return utils.mixin(settings, {
        lint: lint
    });
});
