/**
*/

define(function(require, exports, module) {

    // Setup coffee script linting engine.
    require(["lib/coffee-script"], function(CoffeeScript) {
        window.CoffeeScript = CoffeeScript;
        require(["lib/coffeelint"], $.noop);
    });

    var linterReporter = require("linterReporter"),
        groomer  = require("plugins/coffeehint/groomer");


    function lint(cm, settings) {
        // Get document as a string to be passed into JSHint
        var docValue = cm.getDoc().getValue(), result;

        try {
            console.log(settings);
            result = coffeelint.lint(docValue, settings);

            // If result is false, then JSHint has some errors it needs to report
            if (result && result.length) {
                linterReporter.report(cm, result, {
                    // Groom is a callback from the reporter to give a chance at
                    // massaging the message and return a CodeMirror token.
                    groom: function(message) {
                        return groomer.groom(message, settings);
                    }
                });
            }
        }
        catch(ex) {
        }
    }


    return {
        language: "coffeescript",
        lint: lint,

        defaultSettings: {
        },

        settingsFile: ".coffeehintrc"
    };

});
