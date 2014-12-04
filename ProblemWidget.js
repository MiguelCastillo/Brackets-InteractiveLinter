define(function (require, exports, module) {
    "use strict";

    var InlineWidget = brackets.getModule("editor/InlineWidget").InlineWidget;

    var widgetTemplate = require("text!templates/inlineWidgetLint.html");

    function ProblemWidget(mark, line) {
        InlineWidget.call(this);

        var problems = [].concat(mark.warnings, mark.errors);

        var $html = $(Mustache.render(widgetTemplate, { messages: problems }));

        this.$wrapperDiv = $html;
        this.$htmlContent.append(this.$wrapperDiv);

        this.$wrapperDiv.on("mousedown", function (e) {
            e.stopPropagation();
        });

        this.line = line;

        this._sizeEditorToContent   = this._sizeEditorToContent.bind(this);
    }

    ProblemWidget.prototype = Object.create(InlineWidget.prototype);
    ProblemWidget.prototype.constructor = ProblemWidget;
    ProblemWidget.prototype.parentClass = InlineWidget.prototype;

    ProblemWidget.prototype.$wrapperDiv = null;
    ProblemWidget.prototype.$scroller = null;

    ProblemWidget.prototype.onAdded = function () {
        ProblemWidget.prototype.parentClass.onAdded.apply(this, arguments);

        // Set height initially, and again whenever width might have changed (word wrap)
        this._sizeEditorToContent();
        $(window).on("resize", this._sizeEditorToContent);
    };

    ProblemWidget.prototype.onClosed = function () {
        ProblemWidget.prototype.parentClass.onClosed.apply(this, arguments);

        $(window).off("resize", this._sizeEditorToContent);
    };

    ProblemWidget.prototype._sizeEditorToContent = function () {
        this.hostEditor.setInlineWidgetHeight(this, this.$wrapperDiv.height() + 20, true);
    };

    module.exports = ProblemWidget;
});
