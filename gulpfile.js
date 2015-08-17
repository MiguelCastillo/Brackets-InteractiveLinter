/*eslint-env node */
var gulp = require("gulp");

gulp.task("default", ["jshint"], function () {
    console.log("Installing dependencies");
    return;
});

gulp.task("jshint", function () {
    return gulp.src("./node_modules/jshint/dist/jshint.js")
        .pipe(gulp.dest("./plugins/default/jshint/libs"));
});
