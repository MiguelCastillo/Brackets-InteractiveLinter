/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require /*, exports, module*/) {

    require("jsonlint/libs/jsonlint");
    var utils           = require("libs/utils"),
        groomer         = require("jsonlint/groomer"),
        defaultSettings = JSON.parse(require("text!jsonlint/default.json")),
        settings        = JSON.parse(require("text!jsonlint/settings.json"));
    
    var lastError = null;

    // Let's override the parseError method so that we can get access to the object
    // with the details about it.
    jsonlint.parseError = function parseError(str, hash) {
        lastError = hash;
        throw new Error(str);
    };


    function lint(text, settings) {
        var errors;
        settings = utils.mixin({}, defaultSettings, settings);
        
        try {
            jsonlint.parse(text);
        }
        catch(ex) {
            if (lastError) {
                lastError.token = groomer.groom(lastError);
                errors = [utils.mixin({}, lastError)];
                lastError = null;
            }
        }

        return errors;
    }

    return utils.mixin(settings, {
        lint: lint
    });
});
