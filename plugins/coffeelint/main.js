/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */

// JSHINT will create a window object if one does not exist, but
// I will just create one if one does not exist in case JSHINT loads
// after coffeelint
var window = window || {};

define(function(require, exports, module) {

    var defaultSettings = {};

    // Crazy hacks...
    // JSHINT will insert a fake window object...  This completely throws off coffeelint
    // because coffeelint blindly checks to see if window is defined and then it assumes
    // that it is a valid window object...
    if ( window ) {
        window.addEventListener = window.addEventListener || function(){};
    }

    var coffeelint;
    require(["coffeelint/libs/coffee-script"], function(coffeescript){
        if ( window ) {
            window.CoffeeScript = coffeescript;
        }

        require(["coffeelint/libs/coffeelint"], function(linter) {
            coffeelint = linter;
        });
    });

    var groomer = require("coffeelint/groomer");


    function lint(text, settings) {
        // Get document as a string to be passed into JSHint
        var result;
        settings = settings || defaultSettings;

        try {
            result = coffeelint.lint(text, settings);
            for ( var iresult in result ) {
                result[iresult].token = groomer.groom(result[iresult], settings);
            }
        }
        catch(ex) {
            console.log("ex");
        }

        return result;
    }


    return {
        language: "coffeescript",
        lint: lint,

        defaultSettings: defaultSettings,
        settingsFile: ".coffeelintrc"
    };

});
