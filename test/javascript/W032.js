var exports = {};

/* Using tabs rather than spaces.  We can see the bug with
* JSHint reporting the wrong character position
*/
exports.group1 = {
	setUp: function () {
	}
};	;	;	;	; /* this is more of a corner case, but either way the position of the character return by JSHint is not correct becuse of the tabs*/

exports.group2 = {
	setUp: function () {
	}
};  ;   ;   ;   ;

function test () { function process() {}; process();; return true; };

test();
