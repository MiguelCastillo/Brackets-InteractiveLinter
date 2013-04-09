var exports = {};

exports.group1 = {
	setUp: function (cb) {
		if (!process.stdout.flush) {
				process.stdout.flush = function () { return true; };
		}
	}
};


exports.group2 = {
    setUp: function (cb) {
        if (!process.stdout.flush) {
            process.stdout.flush = function () { return true; };
        }
    }
};
