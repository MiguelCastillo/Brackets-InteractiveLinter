define(function (require, exports, module) {
    "use strict";

    var EditorManager    = brackets.getModule("editor/EditorManager"),
        MainViewManager  = brackets.getModule("view/MainViewManager"),
        WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        StringUtils      = brackets.getModule("utils/StringUtils");

    var linterManager   = require("linterManager"),
        linterReporter  = require("linterReporter"),
        linterHelper    = require("linterHelper"),
        lintIndicator   = require("lintIndicator"),
        panelTemplate   = require("text!templates/problemsPanel.html"),
        resultsTemplate = require("text!templates/problemsPanelTable.html"),
        problemsPanel,
        $problemsPanelTable,
        collapsed = true;

    function showPanel() {
        if (linterHelper.hasProblems()) {
            problemsPanel.show();
        }
    }


    function hidePanel() {
        problemsPanel.hide();
    }


    function handleIndicatorClick() {
        if (linterHelper.hasProblems()) {
            if (problemsPanel.isVisible()) {
                collapsed = true;
                hidePanel();
            } else {
                collapsed = false;
                showPanel();
            }
        } else {
            hidePanel();
        }
    }


    function createPanel() {
        var $panelHtml = $(Mustache.render(panelTemplate));
        problemsPanel = WorkspaceManager.createBottomPanel("interactive-linter.linting.messages", $panelHtml, 100);
        var $selectedRow;
        $problemsPanelTable = problemsPanel.$panel.find(".table-container")
            .on("click", "tr", function (e) {
                if ($selectedRow) {
                    $selectedRow.removeClass("selected");
                }

                $selectedRow = $(e.currentTarget);
                $selectedRow.addClass("selected");

                // This is a inspector title row, expand/collapse on click
                if ($selectedRow.hasClass("inspector-section")) {
                    // Clicking the inspector title section header collapses/expands result rows
                    $selectedRow.nextUntil(".inspector-section").toggle();

                    $(".provider-name", $selectedRow).toggleClass("expanded");
                } else {
                    // This is a problem marker row, show the result on click
                    // Grab the required position data
                    var lineTd    = $selectedRow.find(".line-number");
                    var line      = parseInt(lineTd.text(), 10) - 1;  // convert friendlyLine back to pos.line
                    // if there is no line number available, don't do anything
                    if (!isNaN(line)) {
                        var character = lineTd.data("character");

                        var editor = EditorManager.getCurrentFullEditor();
                        editor.setCursorPos(line, character, true);
                        MainViewManager.focusActivePane();
                    }
                }
            });

        problemsPanel.$panel.on("click", ".close", function () {
            collapsed = true;
            hidePanel();
        });
    }


    function updateTitle() {
        var numberOfProblems = linterHelper.getAmountOfProblems(),
            message;

        if (numberOfProblems === 1) {
            message = "Interactive Linter: 1 Linter Problem";
        }
        else {
            message = StringUtils.format("Interactive Linter: {0} Linter Problems", numberOfProblems);
        }
        problemsPanel.$panel.find(".title").text(message);
    }


    function handleMessages(results) {
        if (results && results.length > 0) {
            var html = Mustache.render(resultsTemplate, { results: results });

            $problemsPanelTable
                .html(html)
                .scrollTop(0);

            if (!collapsed) {
                showPanel();
            }

            updateTitle();
        }
        else {
            hidePanel();
        }
    }


    $(linterReporter).on("lintMessage", function (evt, results) {
        handleMessages(results);
    });

    $(linterManager).on("linterNotFound", function () {
        hidePanel();
    });

    createPanel();

    $(lintIndicator).on("indicatorClicked", function () {
        handleIndicatorClick();
    });
});
