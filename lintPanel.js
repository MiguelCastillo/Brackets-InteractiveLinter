define(function (require, exports, module) {
    var EditorManager    = brackets.getModule("editor/EditorManager"),
        MainViewManager  = brackets.getModule("view/MainViewManager"),
        WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        Resizer          = brackets.getModule("utils/Resizer"),
        StringUtils      = brackets.getModule("utils/StringUtils");


    var linterManager   = require("linterManager"),
        linterReporter  = require("linterReporter"),
        panelTemplate   = require("text!templates/problemsPanel.html"),
        resultsTemplate = require("text!templates/problemsPanelTable.html"),
        singleError     = 'Interactive Linter: 1 Linter Problem',
        multipleErrors  = 'Interactive Linter: {0} Linter Problems',
        $problemsPanel,
        $problemsPanelTable;


    function createPanel() {
        var $panelHtml = $(Mustache.render(panelTemplate));
        var Panel = WorkspaceManager.createBottomPanel("interactive-linter.linting.messages", $panelHtml, 100);
        Panel.setVisible(true);

        $problemsPanel = $("#interactive-linter-problems-panel");
        $problemsPanelTable = $problemsPanel.find(".table-container");

        $problemsPanelTable.on("click", "tr", function (e) {
            var $target = $(e.currentTarget);
            // Grab the required position data
            var lineTd    = $target.find(".line-number");
            var line      = parseInt(lineTd.text(), 10) - 1; // Convert from friendly line to actual line number

            // if there is no line number available, don't do anything
            if (!isNaN(line)) {
                var character = lineTd.data("character") - 1; // Convert from friendly character to actual character

                var editor = EditorManager.getCurrentFullEditor();
                editor.setCursorPos(line, character, true);
                MainViewManager.focusActivePane();
            }
        });
    }


    function updateTitle(numProblems) {
        var message;
        if (numProblems === 1) {
            message = singleError;
        } else {
            message = StringUtils.format(multipleErrors, numProblems);
        }
        $problemsPanel.find(".title").text(message);
    }

    function handleMessages(messages) {
        var html = Mustache.render(resultsTemplate, {messages: messages});

        $problemsPanelTable
            .empty()
            .append($(html))
            .scrollTop(0);

        Resizer.show($problemsPanel);

        updateTitle(messages.length);
    }

    createPanel();

    $(linterReporter).on("lintMessage", function (evt, messages) {
        handleMessages(messages);
    });

    $(linterManager).on("linterNotFound", function () {
        Resizer.hide($problemsPanel);
    });
});
