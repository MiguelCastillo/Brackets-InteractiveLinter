/*eslint-env node */
var gulp = require("gulp");

gulp.task("default", ["jshint", "jsonlint", "htmlhint", "jscs", "coffeelint", "requirejs"], function () {
    console.log("Installed plugins");
    return;
});

gulp.task("jshint", function () {
    return gulp.src("./node_modules/jshint/dist/jshint.js")
        .pipe(gulp.dest("./plugins/default/jshint/libs"));
});

gulp.task("jsonlint", function () {
    return gulp.src("./node_modules/jsonlint/lib/jsonlint.js")
        .pipe(gulp.dest("./plugins/default/jsonlint/libs"));
});

gulp.task("htmlhint", function () {
    return gulp.src("./node_modules/htmlhint/lib/htmlhint.js")
        .pipe(gulp.dest("./plugins/default/htmlhint/libs"));
});

gulp.task("jscs", function () {
    return gulp.src("./node_modules/jscs/jscs-browser.js")
        .pipe(gulp.dest("./plugins/default/jscs/libs"));
});

gulp.task("coffeelint", function () {
    return gulp.src("./node_modules/coffeelint/lib/coffeelint.js")
        .pipe(gulp.dest("./plugins/default/coffeelint/libs"));
});

gulp.task("requirejs", function () {
    return gulp.src("./node_modules/requirejs/require.js")
        .pipe(gulp.dest("./libs/js/"));
});
