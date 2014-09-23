/* globals Mustache */
define(function (require, exports, module) {
    var StatusBar        = brackets.getModule("widgets/StatusBar"),
        DefaultDialogs   = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs          = brackets.getModule("widgets/Dialogs"),
        linterReporter   = require("linterReporter");

    var INDICATOR_ID = "interactive-linter-status-bar-error-indicator";
    var INDICATOR_CLASSES = "interactive-linter-status-bar-error-indicator";
    var INDICATOR_TOOLTIP = "Click for more information.";
    var DIALOG_TITLE = "Interactive Linter: Fatal Linter Error";
    var ERROR_DIALOG_TEMPLATE = require("text!templates/errorDialog.html");

    var currentMessage, dialogContent;

    var $statusBarIndicator = $('<div>&nbsp;</div>');
    $statusBarIndicator.on('click', statusIndicatorClickHandler);

    StatusBar.addIndicator(INDICATOR_ID, $statusBarIndicator, false, INDICATOR_CLASSES, INDICATOR_TOOLTIP);

    $(linterReporter).on("fatalError", function (evt, message) {
        fatalErrorHandler(message);
    });

    function statusIndicatorClickHandler() {
        if (!currentMessage) {
            return;
        }

        Dialogs.showModalDialog(DefaultDialogs.DIALOG_ID_ERROR, DIALOG_TITLE, dialogContent);
    }

    function fatalErrorHandler(message) {
        currentMessage = message;

        if (message) {
            $statusBarIndicator.addClass('pulse');

            dialogContent = Mustache.render(ERROR_DIALOG_TEMPLATE, {line: message.line, character: message.character, error: message.reason, href: message.href});

            setStatusBarIndicatorVisibility(true);
        } else {
            $statusBarIndicator.removeClass('pulse');
            setStatusBarIndicatorVisibility(false);
        }
    }

    function setStatusBarIndicatorVisibility(visibility) {
        StatusBar.updateIndicator(INDICATOR_ID, visibility, $statusBarIndicator.attr('class'), $statusBarIndicator.attr('title'));
    }
});
