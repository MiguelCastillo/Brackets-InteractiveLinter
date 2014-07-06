/**
 * Interactive Linter - JSCS plugin Copyright (c) 2014 Santhosh Thottingal
 *
 * Licensed under MIT
 */

define(function (require /*, exports, module*/ ) {

	var JscsStringChecker = require("plugins/jscs/libs/jscs-browser.js"),
		utils = require("libs/utils"),
		groomer = require("jscs/groomer"),
		settings = JSON.parse(require("text!jscs/settings.json"));

	function lint(text, settings) {
		var i, length, error, jscs, errors, errList;

		settings = utils.mixin({}, settings);
		jscs = new JscsStringChecker();
		jscs.registerDefaultRules();
		jscs.configure(settings);
		errors = jscs.checkString(text);
		errList = errors.getErrorList().slice(0);

		for (i = 0, length = errList.length; i < length; i++) {
			errList[i].token = groomer.groom(errList[i], settings);
		}

		return errList;
	}

	return utils.mixin(settings, {
		lint: lint
	});
});