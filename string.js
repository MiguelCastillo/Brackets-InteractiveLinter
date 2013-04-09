define(function(){

    //
    // Directly pulled from http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
    // post 256
    //

    //first, checks if it isn't implemented yet
    if (!String.prototype.format) {
      String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
          return typeof args[number] != 'undefined'
            ? args[number]
            : match
          ;
        });
      };
    }
});
