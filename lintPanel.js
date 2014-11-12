define(function (require, exports, module) {

    var EditorManager    = brackets.getModule("editor/EditorManager"),
        MainViewManager  = brackets.getModule("view/MainViewManager"),
        WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        Resizer          = brackets.getModule("utils/Resizer"),
        StringUtils      = brackets.getModule("utils/StringUtils"),
        _                = brackets.getModule("thirdparty/lodash");


    var linterManager   = require("linterManager"),
        linterReporter  = require("linterReporter"),
        panelTemplate   = require("text!templates/problemsPanel.html"),
        resultsTemplate = require("text!templates/problemsPanelTable.html"),
        $problemsPanel,
        $problemsPanelTable,
        collapsed = true,
        hasErrors = false;


    function handleIndicatorClick() {
        if (!hasErrors) {
            hidePanel();
        } else {
            if (Resizer.isVisible($problemsPanel)) {
                collapsed = true;
                hidePanel();
            } else {
                collapsed = false;
                showPanel();
            }
        }
    }


    function showPanel() {
        if (hasErrors) {
            Resizer.show($problemsPanel);
        }
    }


    function hidePanel() {
        Resizer.hide($problemsPanel);
    }


    function createPanel() {
        var $panelHtml = $(Mustache.render(panelTemplate));
        WorkspaceManager.createBottomPanel("interactive-linter.linting.messages", $panelHtml, 100);

        $problemsPanel = $("#problems-panel");
        $problemsPanelTable = $problemsPanel.find(".table-container");

        $problemsPanelTable.on("click", "tr", function () {
            var $target = $(this);
            // Grab the required position data
            var line = parseInt($target.data("line"), 10) - 1; // Convert from friendly line to actual line number

            // if there is no line number available, don't do anything
            if (!isNaN(line)) {
                var character = $target.data("character") - 1; // Convert from friendly character to actual character

                var editor = EditorManager.getCurrentFullEditor();
                editor.setCursorPos(line, character, true);
                MainViewManager.focusActivePane();
            }
        });

        $problemsPanel.on("click", ".close", function () {
            collapsed = true;
            hidePanel();
        });
    }


    function updateTitle(numProblems) {
        var message;
        if (numProblems === 1) {
            message = 'Interactive Linter: 1 Linter Problem';
        }
        else {
            message = StringUtils.format('Interactive Linter: {0} Linter Problems', numProblems);
        }
        $problemsPanel.find(".title").text(message);
    }


    function handleMessages(results) {
        if (results) {
            hasErrors = true;
            var html = Mustache.render(resultsTemplate, {results: results});

            $problemsPanelTable
                .html(html)
                .scrollTop(0);

            if (!collapsed) {
                showPanel();
            }

            var errorAmount = _.reduce(results, function (accumulator, value) {
                if (value.result) {
                    return accumulator + value.result.errors.length;
                }
                else {
                    return accumulator;
                }
            }, 0);

            updateTitle(errorAmount);
        }
        else {
            hasErrors = false;
            hidePanel();
        }
    }


    $(linterReporter).on("lintMessage", function (evt, results) {
        handleMessages(results);
    });

    $(linterManager).on("linterNotFound", function () {
        hasErrors = false;
        hidePanel();
    });

    createPanel();

    $(document).on("click", "#interactive-linter-lint-indicator", function () {
        handleIndicatorClick();
    });
});
