Brackets-Interactive-Linter
===========================

<p>Brackets integration with JSHint, JSLint, and CoffeeLint!  Interactive Linter runs linters as you work on your code and gives instant feedback right on your document.  You can access the details of the lint report by clicking on the light bulbs on the line gutters.
<p>Interactive linter provides a plugin system to integrate with your own linter.</p>


JSHint/JSLint
===================
<p>Interactive Linter loads .jshintrc and .jslintrc files in your project. If one doesn't exist, Interactive Linter will create one so that you can easily customize linting for your projects.</p>
<p>All jshint settings that already exists inline in your JavaScript files will continue to work along side any .jshintrc/.jslintrc file.</p>
<p>Integration with http://jslinterrors.com/ to find out details about what's reported by JSHint.</p>
<p>This was inspired by Joachim's extions brackets-continuous-compilation (https://github.com/JoachimK/brackets-continuous-compilation)</p>


 CoffeeLint
===================
<p>CoffeeLinter does not yet have a standard file that's loaded and process by the linter itself.  So, while this is resolved by CoffeeLint, I have added support for .coffeelintrc to follow analogous system to JSLint and JSHint.</p>


How to
===================

* Install... Open Brackets then copy and paste https://github.com/MiguelCastillo/Brackets-Interactive-Linter into File->Install Extension.  You don't need to restart Brackets.


FAQ
===================

* Use JSLint instead of JSHint? Yes, it is possible. Although it requires manual intervention.
    - Open up the plugins directory in the Interactive Linter
    - Rename jshint.js to jshint.js.disabled
    - Rename jslint.js.disabled to jslint.js
    - Reload Bracket and enjoy JSLint

* Are .jshintrc supported?
    - Yes, they are supported but in the context of a project.


Links
===================
Brackets? Right here... http://brackets.io/ <br>
Brackets github? Right here... https://github.com/adobe/brackets


Contact me
===================

If you have any issues or want to just drop in a line, you can use my personal email at manchagnu@gmail.com

License
===================

Licensed under MIT
