define(function(require, exports, module) {

    var JSLINT = require('jslint/libs/jslint'),
        groomer  = require("jslint/groomer");

    function lint(text, settings) {
        if ( !JSLINT(text, settings) ) {
            return JSLINT.errors;
        }
    }

    return {
        language: "disabled-javascript",
        lint: lint,
        groomer: groomer
    };

});
