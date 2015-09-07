/**
 * Interactive Linter - JSCS plugin Copyright (c) 2014 Santhosh Thottingal
 *
 * Licensed under MIT
 */

define(function (require /*, exports, module*/) {
    "use strict";

    var JSCS           = require("jscs/libs/jscs-browser");
    var belty          = require("libs/belty");
    var groomer        = require("jscs/groomer");
    var defaultOptions = JSON.parse(require("text!jscs/default.json"));
    var settings       = JSON.parse(require("text!jscs/settings.json"));

    function lint(text, options) {
        options = belty.extend({}, defaultOptions, options);
        var i, length, jscs, errors, errList;

        try {
            jscs = new JSCS();
            jscs.registerDefaultRules();
            jscs.configure(options);
            errors = jscs.checkString(text);
            errList = errors.getErrorList().slice(0);

            for (i = 0, length = errList.length; i < length; i++) {
                groomer.groom(errList[i], options);
            }
        }
        catch(ex) {
            console.log(ex.message);
        }

        return errList;
    }

    return belty.extend(settings, {
        lint: lint
    });
});
