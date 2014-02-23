/**
 * rjasmine Copyright (c) 2014 Miguel Castillo.
 * Licensed under MIT
 *
 * https://github.com/MiguelCastillo/rjasmine
 */


define([
], function() {
  "use strict";

  function timer(start) {
    if(start !== false) {
      this.start();
    }
  }


  timer.units = {
    msec: 1,
    secs: 1000,
    mins: 1000 * 60,
    hours: 1000 * 60 * 60
  };


  timer.prototype.start = function() {
    this._start = Date.now();
  };


  timer.prototype.end = function() {
    this._end = Date.now();
  };


  timer.prototype.elapsed = function(unit) {
    if ( isNaN(unit) === true ) {
      unit = timer.units.secs;
    }

    this.end();
    return (this._end - this._start)/unit;
  };

  return timer;
});

