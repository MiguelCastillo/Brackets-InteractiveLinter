define(function (require/*, exports, module*/) {
    'use strict';

    var AppInit          = brackets.getModule("utils/AppInit"),
        CodeInspection   = brackets.getModule("language/CodeInspection"),
        CommandManager   = brackets.getModule("command/CommandManager"),
        Commands         = brackets.getModule("command/Commands"),
        DefaultDialogs   = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs          = brackets.getModule("widgets/Dialogs"),
        MainViewManager  = brackets.getModule("view/MainViewManager"),
        StatusBar        = brackets.getModule("widgets/StatusBar"),
        StringUtils      = brackets.getModule("utils/StringUtils");

    var linterReporter = require("linterReporter"),
        linterManager  = require("linterManager"),
        dialogTemplate = require("text!templates/errorDialog.html");

    var $statusBarIndicator = $('<div>&nbsp;</div>');
    var dialogContent;

    var INDICATOR_TOOLTIPS = {
        OK: "Interactive Linter found no problems in code.",
        WARNING: "Interactive Linter found {0} problem(s) in code.",
        ERROR: "Interactive Linter encountered a fatal error, click for more details.",
        DISABLED: "Interactive Linter is disabled, or there are no linters for this file."
    };

    var INDICATOR_STATUS = {
        OK: 'okay',
        WARNING: 'warning',
        ERROR: 'error',
        DISABLED: 'inactive'
    };

    function setStatus(status) {
        $statusBarIndicator.attr("status", status);
    }

    function indicatorClickHandler() {
        if ($statusBarIndicator.attr("status") === INDICATOR_STATUS.ERROR) {
            Dialogs.showModalDialog(DefaultDialogs.DIALOG_ID_ERROR, "Interactive Linter: Fatal Linter Error", dialogContent);
        }
    }

    function fatalErrorHandler(message) {
        if (message) {
            setStatus(INDICATOR_STATUS.ERROR);
            $statusBarIndicator.attr("title", INDICATOR_TOOLTIPS.ERROR);

            dialogContent = Mustache.render(dialogTemplate, {
                line: message.line,
                character: message.character,
                error: message.reason,
                href: message.href
            });
        }
    }

    function lintMessageHandler(messages) {
        if (messages) {
            setStatus(INDICATOR_STATUS.WARNING);
            $statusBarIndicator.attr('title', StringUtils.format(INDICATOR_TOOLTIPS.WARNING, messages.length));
        }
        else {
            setStatus(INDICATOR_STATUS.OK);
            $statusBarIndicator.attr('title', INDICATOR_TOOLTIPS.OK);
        }
    }

    StatusBar.addIndicator("interactive-linter-lint-indicator", $statusBarIndicator, true, "interactive-linter-lint-indicator", "", "status-indent");
    setStatus(INDICATOR_STATUS.DISABLED);

    AppInit.appReady(function () {
        CodeInspection.toggleEnabled(false, true);

        $(MainViewManager).one("currentFileChange", function () {
            $('#status-inspection').hide();
            CommandManager.get(Commands.VIEW_TOGGLE_INSPECTION).setChecked(false);
            CommandManager.get(Commands.VIEW_TOGGLE_INSPECTION).setEnabled(false);
        });
    });


    $(linterManager).on("linterNotFound", function () {
        setStatus(INDICATOR_STATUS.DISABLED);
        $statusBarIndicator.attr('title', INDICATOR_TOOLTIPS.DISABLED);
    });

    $(linterReporter).on("lintMessage", function (evt, messages) {
        lintMessageHandler(messages);
    });

    $(linterReporter).on("fatalError", function (evt, message) {
        fatalErrorHandler(message);
    });

    $statusBarIndicator.on('click', indicatorClickHandler);
});
