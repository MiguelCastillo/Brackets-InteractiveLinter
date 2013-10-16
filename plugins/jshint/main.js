define(function(require, exports, module) {

    /**
    * BUG: jshint gives the wrong character index when dealing with tabs.
    * https://github.com/jshint/jshint/issues/430
    * I am stuck only expecting correct results when the files uses white
    * spaces. Arrrggh!
    */

    require("jshint/libs/jshint-2.1.9");
    var groomer = require("jshint/groomer");
    var defaultSettings = require("text!jshint/defaults.json");


    function lint( text, settings) {
        // Get document as a string to be passed into JSHint
        if ( !JSHINT(text, settings, settings.globals) ) {
            // If result is false, then JSHint has some errors it needs to report
            return JSHINT.errors;
        }
    }


    return {
        language: "javascript",
        lint: lint,
        groomer: groomer,

        // Default settings
        defaultSettings: JSON.parse(defaultSettings || "{}"),
        settingsFile: ".jshintrc"
    };
});
