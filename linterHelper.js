define(function (require, exports, module) {
    var CodeInspection = brackets.getModule("language/CodeInspection"),
        _              = brackets.getModule("thirdparty/lodash");


    var linterManager  = require("linterManager"),
        linterReporter = require("linterReporter");

    var isLinterNotFound,
        lastResult,
        Status = {
            OK: "okay",
            WARNING: "warning",
            ERROR: "error",
            DISABLED: "inactive"
        };

    function _getReducedProblems() {
        return _.reduce(lastResult, function (accumulator, value) {
            if (value.result) {
                return accumulator.concat(value.result.errors);
            }
            else {
                return accumulator;
            }
        }, []);
    }


    function getAmountOfProblems() {
        return _getReducedProblems().length;
    }


    function getAmountOfProviders() {
        return _.filter(lastResult, function (result) {
            return result.result && result.result.errors.length > 0;
        }).length;
    }


    function hasProblems() {
        return getAmountOfProblems() > 0;
    }


    function getCurrentStatus() {
        if (hasProblems()) {
            var problems = _getReducedProblems();

            if (_.some(problems, { type: CodeInspection.Type.ERROR })) {
                return Status.ERROR;
            } else { // Since there are no "ERROR" type problems, the status is warning.
                return Status.WARNING;
            }
        } else {
            if (isLinterNotFound) {
                return Status.DISABLED;
            } else {
                return Status.OK;
            }
        }
    }

    function handleReporterResult(result) {
        lastResult = result;
    }

    $(linterReporter).on("lintMessage", function (e, result) {
        isLinterNotFound = false;
        handleReporterResult(result);
    });

    /*
     * Effectively equivalent to linterReporter firing lintMessage with result === []
     */
    $(linterManager).on("linterNotFound", function () {
        isLinterNotFound = true;
        handleReporterResult([]);
    });

    return {
        getCurrentStatus: getCurrentStatus,
        getAmountOfProblems: getAmountOfProblems,
        getAmountOfProviders: getAmountOfProviders,
        hasProblems: hasProblems,
        Status: Status,
    };
});
