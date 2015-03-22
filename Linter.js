define(function(require, exports, module) {
    "use strict";

    function Linter(options) {
        options = options || {};
        this._name = options.name;
    }


    Linter.prototype.getName = function() {
        return this._name;
    };


    Linter.prototype.lint = function() {
        throw new TypeError("Not implemented");
    };


    Linter.prototype.dispose = function() {
    };


    module.exports = Linter;
});
