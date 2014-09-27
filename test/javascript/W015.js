/* This error only happens in strict mode */

define(function() {
    'use strict';

    function successCallback (fileEntry) {
        console.log(fileEntry);
    }

    successCallback(null);
});

