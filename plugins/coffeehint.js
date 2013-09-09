/**
*/

define(function(require, exports, module) {

    // Setup coffee script linting engine.
    require(["lib/coffee-script"], function(CoffeeScript) {
        window.CoffeeScript = CoffeeScript;
        require(["lib/coffeelint"], $.noop);
    });

    var groomer = require("plugins/coffeehint/groomer");


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

        settingsFile: ".coffeehintrc"
    };

});
