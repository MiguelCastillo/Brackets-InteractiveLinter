Brackets-InteractiveLinter
===========================
Brackets integration with JSHint, JSLint, and CoffeeLint! Interactive Linter runs linters as you work on your code and gives instant feedback right on your document.  You can access the details of the lint report by clicking on the light bulbs on the line gutters or using the keyboard shortcut `Ctrl-Shift-E` on that line.

Features
===================
* Real time feedback
* Plugin system that runs plugins in a worker thread
* Traverses up the directory tree to load the most appropriate linter settings file
* Let's you provide default linter settings that get mixed in with project specific ones.  Reduce duplication!
* Configure the linter settings file that gets loaded. Maybe you want to load `jshintrc.json` instead of `.jshintrc`
* Configuration files hot reload. So if you adjust you beloved `.jshintrc`, Interactive Linter will automatically reload it.
* Skips blocks of minified code to avoid cluttering your reports. (Minified code is determined by amount of characters per-line)


JSHint/JSLint
===================
Interactive Linter automatically loads `.jshintrc` and `.jslintrc` files in your project.

All JSHint settings that already exists inline in your JavaScript files will continue to work along side any `.jshintrc`/`.jslintrc` file.

Integration with <http://jslinterrors.com/> to find out details about what's reported by JSHint.

Inspired by Joachim's extensions [brackets-continuous-compilation](https://github.com/JoachimK/brackets-continuous-compilation).


CoffeeLint
===================
Support for loading `coffeelint.json` as defined [here](http://www.coffeelint.org/#usage).

Screenshots
===================

![jshint](https://raw.github.com/wiki/MiguelCastillo/Brackets-InteractiveLinter/images/jshint.png)

![coffeelint](https://raw.github.com/wiki/MiguelCastillo/Brackets-InteractiveLinter/images/coffeelint.png)

Installation
===================

Please use the Brackets Extension Manager to install.


FAQ
===================

* Use JSLint instead of JSHint? Yes, it is possible. Although it requires manual intervention.
    - Open up the plugins directory in Interactive Linter
    - Go into jshint/settings.json, find "language": "javascript" and change to "language": "disabled-javascript"
    - Go into jslint/settings.json, find "language": "disabled-javascript" and change to "language": "javascript"
    - Reload Brackets and enjoy JSLint

* Are .jshintrc supported?
    - Yes, they are!

* Can I configure default linter settings?
    - Yes you can.  You will need to edit the `default.json` file located in each linter and replace its contents with whatever settings you always want loaded. For example, if you want to set default settings for JSHint, you will need to navigate to the `extensions/user/interactive-linter/plugins/jshint/default.json` file and modify accordingly.  These settings are mixed in with any other settings found by Interactive Linter.

* Can I configure the settings file the linters load?
   - Yes you can!  You will need to find settings.json for the particular interactive linter plugin, and change the `settingsFile`.  For example, if you want to configure Interactive Linter to load `jshintrc.json` instead of default `.jshintrc`, find the file `extensions/user/interactive-linter/plugins/jshint/settings.json` and modify the `settingsFile` value to the name of your linter configuration file.


Links
===================
 - Brackets: <http://brackets.io>
 - Brackets Github: <https://github.com/adobe/brackets>


Contributors
===================
Miguel Castillo - @manchagnu
Mark Simulacrum - @MarkSimulacrum 


Contact me
===================

If you have any issues or want to just drop in a line, you can use my personal email at <mailto:manchagnu@gmail.com>.

License
===================

Licensed under MIT
