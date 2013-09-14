/**
*/

define(function(require, exports, module) {

    // Setup coffee script linting engine.
    require(["coffeelint/libs/coffee-script"], function(CoffeeScript) {
        window.CoffeeScript = CoffeeScript;
        require(["coffeelint/libs/coffeelint"], $.noop);
    });

    var groomer = require("coffeelint/groomer");


    function lint(text, settings) {
        // Get document as a string to be passed into JSHint
        var result;

        try {
            result = coffeelint.lint(text, settings);
        }
        catch(ex) {
        }

        return result;
    }


    return {
        language: "coffeescript",
        lint: lint,
        groomer: groomer,

        defaultSettings: {
        },

        settingsFile: ".coffeelintrc"
    };

});
