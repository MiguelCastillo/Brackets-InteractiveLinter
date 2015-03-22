/**
 * Interactive Linter - JSCS plugin Copyright (c) 2014 Santhosh Thottingal
 *
 * Licensed under MIT
 */

define(function (require /*, exports, module*/) {

    var JscsStringChecker = require("jscs/libs/jscs-browser"),
        utils             = require("libs/utils"),
        groomer           = require("jscs/groomer"),
        settings          = JSON.parse(require("text!jscs/settings.json"));

    function lint(data, settings) {
        var i, length, jscs, errList;

        settings = utils.mixin({}, settings);
        jscs     = new JscsStringChecker();
        jscs.registerDefaultRules();
        jscs.configure(settings);

        errList = jscs.checkString(data.content).getErrorList().slice(0);

        for (i = 0, length = errList.length; i < length; i++) {
            errList[i].token = groomer.groom(errList[i], settings);
        }

        data.result = errList;
    }

    return utils.mixin(settings, {
        lint: lint
    });
});
