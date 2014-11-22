/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */

// JSHINT will create a window object if one does not exist, but
// I will just create one if one does not exist in case JSHINT loads
// after coffeelint
var window = window || {};

define(function(require /*, exports, module*/) {

    // Crazy hacks...
    // JSHINT will insert a fake window object...  This completely throws off coffeelint
    // because coffeelint blindly checks to see if window is defined and then it assumes
    // that it is a valid window object...
    if (window) {
        window.addEventListener = window.addEventListener || function(){};
    }

    var coffeelint;
    require(["coffeelint/libs/coffee-script"], function(coffeescript){
        if (window) {
            window.CoffeeScript = coffeescript;
        }

        require(["coffeelint/libs/coffeelint"], function(linter) {
            coffeelint = linter;
        });
    });

    return {};

});
