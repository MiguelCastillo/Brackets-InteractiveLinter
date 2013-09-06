/* This error only happens in strict mode */

define(function() {
    'use strict';

    function reporter() {
        // This is warning W040
        var _self = this;
        _self.marks = {};
    }

    reporter.prototype.checkFatal = function() {
    };


    var linterReporter = (function () {
        var _reporter = new reporter();
        _reporter.checkFatal();
    })();


    return linterReporter;
});
