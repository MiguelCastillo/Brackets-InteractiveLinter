Brackets-InteractiveLinter
===========================
Brackets integration with JSHint, JSLint, and CoffeeLint!  Interactive Linter runs linters as you work on your code and gives instant feedback right on your document.  You can access the details of the lint report by clicking on the light bulbs on the line gutters.

Features
===================
* Real time feedback
* Plugin system that runs plugins in a worker thread
* Traverse up the directory tree to load the most appropriate linter settings file
* Let's you provide default linter settings that get mixed in with project specific ones.  Reduce duplication!
* Configure the linter settings file that gets loaded. Maybe you want to load jshintrc.json instead of .jshintrc


JSHint/JSLint
===================
<p>Interactive Linter automatically loads .jshintrc and .jslintrc files in your project.</p>
<p>All jshint settings that already exists inline in your JavaScript files will continue to work along side any .jshintrc/.jslintrc file.</p>
<p>Integration with http://jslinterrors.com/ to find out details about what's reported by JSHint.</p>
<p>This was inspired by Joachim's extensions brackets-continuous-compilation (https://github.com/JoachimK/brackets-continuous-compilation)</p>


 CoffeeLint
===================
<p>CoffeeLinter does not yet have a standard file that's loaded and processed by the linter itself.  So, while this is resolved by CoffeeLint, I have added support for .coffeelintrc to follow analogous system to JSLint and JSHint.</p>

Screenshots
===================

![jshint](https://raw.github.com/wiki/MiguelCastillo/Brackets-InteractiveLinter/images/jshint.png)

![coffeelint](https://raw.github.com/wiki/MiguelCastillo/Brackets-InteractiveLinter/images/coffeelint.png)

How to
===================

* Install... Go through the Brackets Extensions Manager.


FAQ
===================

* Use JSLint instead of JSHint? Yes, it is possible. Although it requires manual intervention.
    - Open up the plugins directory in Interactive Linter
    - Go into jshint/settings.json, find "language": "javascript" and change to "language": "disabled-javascript"
    - Go into jslint/settings.json, find "language": "disabled-javascript" and change to "language": "javascript"
    - Reload Bracket and enjoy JSLint

* Are .jshintrc supported?
    - Yes, they are!

* Can I configure default linter settings?
    - Yes you can.  You will need to file the default.json file located in each linter and replace its content with whatever settings you always want loaded.  For example, if you want to set default settings for jshint, you will need to navigate to the extensions/user/interactive/plugins/jshint/default.json file and modify accordingly.  These settings are mixin in with any other settings found by Interactive Linter.

* Can I configure the settings file the linters load?
   - Yes you can!  You will need to find settings.json for the particular interactive linter plugin, and change the settingsPath.  For example, if you want to configure Interactive Linter to load jshintrc.json instead of default .jshintrc, find the file extensions/user/interactive/plugins/jshint/default.json and modify the settingsPath value to jshintrc.json. 


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
