define(function (require/*, exports, module*/) {
    'use strict';

    var AppInit          = brackets.getModule("utils/AppInit"),
        StatusBar        = brackets.getModule("widgets/StatusBar"),
        StringUtils      = brackets.getModule("utils/StringUtils"),
        DefaultDialogs   = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs          = brackets.getModule("widgets/Dialogs"),
        CodeInspection   = brackets.getModule("language/CodeInspection"),
        MainViewManager  = brackets.getModule("view/MainViewManager"),
        _                = brackets.getModule("thirdparty/lodash");

    var linterReporter = require("linterReporter");

    var INDICATOR_ID = "interactive-linter-lint-indicator";
    var INDICATOR_CLASSES = "interactive-linter-lint-indicator";

    var DIALOG_TITLE = "Interactive Linter: Fatal Linter Error";
    var DIALOG_TEMPLATE = require("text!templates/errorDialog.html");

    var INDICATOR_TOOLTIPS = {
        OK: "Interactive Linter found no problems in code.",
        WARNING: "Interactive Linter found {0} problem(s) in code.",
        ERROR: "Interactive Linter encountered a fatal error, click for more details.",
        DISABLED: "Interactive Linter is disabled."
    };

    var INDICATOR_STATUS = {
        OK: 'okay',
        WARNING: 'warning',
        ERROR: 'error',
        DISABLED: 'inactive'
    };

    var $statusBarIndicator = $('<div>&nbsp;</div>');
    var dialogContent;

    AppInit.appReady(function () {
        StatusBar.addIndicator(INDICATOR_ID, $statusBarIndicator, true, INDICATOR_CLASSES);
        CodeInspection.toggleEnabled(false, true);

        $(MainViewManager).one("currentFileChange", function () {
            $('#status-inspection').hide();
        });

        setStatusClass(INDICATOR_STATUS.DISABLED);
    });

    function removeStatusClasses() {
        _.forEach(INDICATOR_STATUS, function (statusClass) {
            $statusBarIndicator.removeClass(statusClass);
        });
    }

    function setStatusClass(status) {
        removeStatusClasses();
        $statusBarIndicator.addClass(status);
    }

    $(linterReporter).on("lintMessage", function (evt, messages) {
        lintMessageHandler(messages);
    });

    $(linterReporter).on("fatalError", function (evt, message) {
        fatalErrorHandler(message);
    });

    $statusBarIndicator.on('click', indicatorClickHandler);

    function indicatorClickHandler() {
        if ($statusBarIndicator.hasClass('error')) {
            Dialogs.showModalDialog(DefaultDialogs.DIALOG_ID_ERROR, DIALOG_TITLE, dialogContent);
        }
    }

    function fatalErrorHandler(message) {
        if (message) {
            setStatusClass(INDICATOR_STATUS.ERROR);
            $statusBarIndicator.attr('title', INDICATOR_TOOLTIPS.ERROR);

            $statusBarIndicator.addClass('pulse');
            setTimeout(function () {
                $statusBarIndicator.removeClass('pulse');
            }, 1000);

            dialogContent = Mustache.render(DIALOG_TEMPLATE, {
                line: message.line,
                character: message.character,
                error: message.reason,
                href: message.href
            });
        }
    }

    function lintMessageHandler(messages) {
        if (messages === undefined || messages.length === 0) {
            setStatusClass(INDICATOR_STATUS.OK);
            $statusBarIndicator.attr('title', INDICATOR_TOOLTIPS.OK);
        }
        else if (messages.length > 0) {
            setStatusClass(INDICATOR_STATUS.WARNING);
            $statusBarIndicator.attr('title', StringUtils.format(INDICATOR_TOOLTIPS.WARNING, messages.length));
        }
    }
});
