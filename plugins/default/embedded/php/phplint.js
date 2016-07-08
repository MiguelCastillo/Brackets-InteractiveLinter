(function () {

    ////////////////////////////////////////////////////////////////////////////////

    var child_process = require('child_process');

    ////////////////////////////////////////////////////////////////////////////////

    exports.init = function (manager) {
        if (!manager.hasDomain('phplint'))
            manager.registerDomain('phplint', {
                major: 1,
                minor: 0
            });

        manager.registerCommand('phplint', 'lintcommand', lintcommand, true ,"Run PHPLinter",[{'name':'text','type':'string','description':'stdin contents'}],[{'name':'errors','type':'string','description':'PHP errors returned'}]);
    };

    ////////////////////////////////////////////////////////////////////////////////

    function lintcommand(text,cb) {
        var proc = child_process.exec("php -d display_errors=1 -l -- -",{},function (err, stdout, stderr) {
            cb(stdout);
        });
        proc.stdin.end(text);
    }

    ////////////////////////////////////////////////////////////////////////////////

}());