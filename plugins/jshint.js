define(function(require, exports, module) {

    /**
    * BUG: jshint gives the wrong character index when dealing with tabs.
    * https://github.com/jshint/jshint/issues/430
    * I am stuck only expecting correct results when the files uses white
    * spaces. Arrrggh!
    */

    require('lib/jshint-2.1.9');
    var linterReporter = require("linterReporter"),
        groomer  = require("plugins/jshint/groomer");


    function lint( cm, settings) {
        // Get document as a string to be passed into JSHint
        var docValue = cm.getDoc().getValue();
        var result = JSHINT(docValue, settings, settings.globals);

        // If result is false, then JSHint has some errors it needs to report
        if (result === false) {
            linterReporter.report(cm, JSHINT.errors, {
                // Groom is a callback from the reporter to give a chance at
                // massaging the message and return a CodeMirror token.
                groom: function(message) {
                    return groomer.groom(message, settings);
                }
            });
        }
    }


    return {
        language: "javascript",
        lint: lint,

        // Default settings
        defaultSettings: {
            "undef": true,
            "unused": true,
            "curly": true,
            "indent": 4,
            "devel": true,
            "laxcasebreak": true,
            "globals": { }
        },
        settingsFiles: ".jshintrc"
    };

});
