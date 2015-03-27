/**
 * Interactive Linter - JSCS plugin Copyright (c) 2014 Santhosh Thottingal
 *
 * Licensed under MIT
 */

define(function (require /*, exports, module*/) {

    var JscsStringChecker = require("jscs/libs/jscs-browser"),
        utils          = require("libs/utils"),
        groomer        = require("jscs/groomer"),
        defaultOptions = JSON.parse(require("text!jscs/default.json")),
        settings       = JSON.parse(require("text!jscs/settings.json"));

    function lint(text, options) {
        options = utils.mixin({}, defaultOptions, options);
        var i, length, jscs, errors, errList;

        try {
            jscs = new JscsStringChecker();
            jscs.registerDefaultRules();
            jscs.configure(options);
            errors = jscs.checkString(text);
            errList = errors.getErrorList().slice(0);

            for (i = 0, length = errList.length; i < length; i++) {
                errList[i].token = groomer.groom(errList[i], options);
            }
        }
        catch(ex) {
            console.error(ex.message);
        }

        return errList;
    }

    return utils.mixin(settings, {
        lint: lint
    });
});
