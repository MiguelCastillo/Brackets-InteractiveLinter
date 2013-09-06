var exports = {};

/* Using tabs rather than spaces.  We can see the bug with
* JSHint reporting the wrong character position
*/
exports.group1 = {
	setUp: function () {
		if (!process.stdout.flush) {
				process.stdout.flush = function () { function process() {} return true; };
		}
	}
};


/* Using spaces and JSHint does report the correct character
* position
*/
exports.group2 = {
    setUp: function () {
        if (!process.stdout.flush) {
            process.stdout.flush = function () { return true; };
        }
    }
};
