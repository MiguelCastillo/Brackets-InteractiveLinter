/*eslint-env node */
var gulp = require("gulp");

gulp.task("default", ["jshint", "jsonlint"], function () {
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
