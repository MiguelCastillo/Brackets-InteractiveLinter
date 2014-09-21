define(function (require, exports, module) {
    var StatusBar        = brackets.getModule("widgets/StatusBar");

    var INDICATOR_ID = "interactive-linter-status-bar-error-indicator";
    var INDICATOR_CLASSES = "interactive-linter-status-bar-error-indicator";
    var INDICATOR_TOOLTIP = "Click for more information.";

    var $statusBarIndicator = $('<div>Fatal JSHint Error!</div>');

    StatusBar.addIndicator(INDICATOR_ID, $statusBarIndicator, false, INDICATOR_CLASSES, INDICATOR_TOOLTIP);

    function show() {
        StatusBar.updateIndicator(INDICATOR_ID, true, INDICATOR_CLASSES, INDICATOR_TOOLTIP);
    }

    function hide() {
        StatusBar.updateIndicator(INDICATOR_ID, false, INDICATOR_CLASSES, INDICATOR_TOOLTIP);
    }

    exports.show = show;
    exports.hide = hide;
    exports.$statusBarIndicator = $statusBarIndicator;
});
