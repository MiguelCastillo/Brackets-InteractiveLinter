define(function (require/*, exports, module*/) {
    "use strict";

    var DefaultDialogs   = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs          = brackets.getModule("widgets/Dialogs"),
        StatusBar        = brackets.getModule("widgets/StatusBar"),
        StringUtils      = brackets.getModule("utils/StringUtils");

    var linterReporter = require("linterReporter"),
        linterManager  = require("linterManager"),
        linterHelper   = require("linterHelper"),
        dialogTemplate = require("text!templates/errorDialog.html");

    var $statusBarIndicator = $("<div>&nbsp;</div>");
    var dialogContent;

    var INDICATOR_TOOLTIPS = {
        NO_ERRORS: "Interactive Linter: No problems found",
        SINGLE_ERROR: "Interactive Linter: 1 problem found.",
        MULTIPLE_ERRORS: "Interactive Linter: {0} problems found.",
        LINT_DISABLED: "Interactive Linter: Linting is disabled."
    };

    function updateStatus() {
        $statusBarIndicator.attr("status", linterHelper.getCurrentStatus());

        var numberOfProblems = linterHelper.getAmountOfProblems();

        if (numberOfProblems === 0) {
            $statusBarIndicator.attr("title", INDICATOR_TOOLTIPS.NO_ERRORS);
        } else if (numberOfProblems === 1) {
            $statusBarIndicator.attr("title", INDICATOR_TOOLTIPS.SINGLE_ERROR);
        } else {
            $statusBarIndicator.attr("title", StringUtils.format(INDICATOR_TOOLTIPS.MULTIPLE_ERRORS, numberOfProblems));
        }
    }

    function indicatorClickHandler() {
        if (dialogContent) {
            Dialogs.showModalDialog(DefaultDialogs.DIALOG_ID_ERROR, "Interactive Linter: Fatal Linter Error", dialogContent);
        }
    }

    function fatalErrorHandler(message) {
        if (message) {
            updateStatus();

            dialogContent = Mustache.render(dialogTemplate, {
                line: message.line,
                character: message.character,
                error: message.reason,
                href: message.href
            });
        } else {
            dialogContent = null;
        }
    }

    function lintMessageHandler() {
        updateStatus();
    }


    StatusBar.addIndicator("interactive-linter-lint-indicator", $statusBarIndicator, true, "", "", "status-indent");
    updateStatus();

    $(linterManager).on("linterNotFound", function () {
        updateStatus();
    });

    $(linterReporter).on("lintMessage", function (evt, messages) {
        lintMessageHandler(messages);
    });

    $(linterReporter).on("fatalError", function (evt, message) {
        fatalErrorHandler(message);
    });

    $statusBarIndicator.on("click", indicatorClickHandler);
});
