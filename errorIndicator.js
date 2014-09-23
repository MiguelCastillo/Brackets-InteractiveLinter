/* globals Mustache */
define(function (require, exports, module) {
    var EditorManager    = brackets.getModule("editor/EditorManager"),
        StatusBar        = brackets.getModule("widgets/StatusBar"),
        DefaultDialogs   = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs          = brackets.getModule("widgets/Dialogs"),
        linterReporter = require("linterReporter");

    var INDICATOR_ID = "interactive-linter-status-bar-error-indicator";
    var INDICATOR_CLASSES = "interactive-linter-status-bar-error-indicator";
    var INDICATOR_TOOLTIP = "Click for more information.";
    var ERROR_DIALOG_TEMPLATE = require("text!templates/errorDialog.html");
    var DIALOG_BTN_GO_TO = "goto";

    var currentMessage, currentDialog, dialogContent;

    var $statusBarIndicator = $('<div>Fatal JSHint Error!</div>');
    $statusBarIndicator.on('click', statusIndicatorClickHandler);

    StatusBar.addIndicator(INDICATOR_ID, $statusBarIndicator, false, INDICATOR_CLASSES, INDICATOR_TOOLTIP);

    $(linterReporter).on("fatalError", function (evt, message) {
        fatalErrorHandler(message);
    });

    function statusIndicatorClickHandler() {
        if (!currentMessage) {
            return;
        }

        currentDialog = Dialogs.showModalDialog(DefaultDialogs.DIALOG_ID_ERROR, "Interactive Linter: Fatal JSHint Error", dialogContent);
    }

    function fatalErrorHandler(message) {
        currentMessage = message;

        if (message) {
            $statusBarIndicator.addClass('pulse');

            dialogContent = Mustache.render(ERROR_DIALOG_TEMPLATE, {line: currentMessage.line, character: currentMessage.character, error: currentMessage.reason, href: currentMessage.href});

            show();
        } else {
            $statusBarIndicator.removeClass('pulse');
            hide();
        }
    }

    function show() {
        StatusBar.updateIndicator(INDICATOR_ID, true, INDICATOR_CLASSES, INDICATOR_TOOLTIP);
    }

    function hide() {
        StatusBar.updateIndicator(INDICATOR_ID, false, INDICATOR_CLASSES, INDICATOR_TOOLTIP);
    }
});
