/* This error only happens in strict mode */

define(function() {
    'use strict';

    function reporter() {
    }

    reporter.prototype.checkFatal = function() {
    };


    var linterReporter = (function () {
        var _reporter = new reporter();
        _reporter.checkFatal();
    })();


    return linterReporter;
});
