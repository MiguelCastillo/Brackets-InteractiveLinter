Brackets-Interactive-Linter
===========================

<p>Brackets integration with JSHint.  Interactive Linter runs JSHint as you work on your JavaScript files and gives instant feedback right on your document.  You can access the details of the JSHint reports by clicking on the light bulbs on the line gutters.
<p>Interactive Linter loads .jshintrc files on your root directory (your project) and if one doesn't exist, Interactive Linter will create one for you so that you can easily customize JSHint for your projects.  Furthermore, all jshint settings that already exists inline in your JavaScript files will continue to work as expected.
<p>Integration with http://jslinterrors.com/ to find out details about what's reported by JSHint.
<p>This was inspired by Joachim's extions brackets-continuous-compilation (https://github.com/JoachimK/brackets-continuous-compilation)


How to
===============

* Install... Open Brackets then copy and paste https://github.com/MiguelCastillo/Brackets-Interactive-Linter into File->Install Extension.  You don't need to restart Brackets.


FAQ
===============

* Use JSLint instead of JSHint? Yes, it is possible. Although it requires manual intervention.
    - 1. Open main.js
    - 2. Locate line 36
    - 3. Replace with linterManager.setType(linterManager.types.jslint);
    - 4. Refresh Brackets.IO and you should now be getting jslint reports

* Are .jshintrc supported?
    - Yes, they are supported but they will only be applied when a project is currently open.


Links
===============
Brackets? Right here... http://brackets.io/ <br>
Brackets github? Right here... https://github.com/adobe/brackets


Contact me
===============

If you have any issues or want to just drop in a line, you can use my personal email at manchagnu@gmail.com

License
===============

Licensed under MIT
