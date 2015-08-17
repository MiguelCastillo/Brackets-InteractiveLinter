/*eslint-env node */
var gulp = require("gulp");
var rename = require("gulp-rename");
var request = require("request");
var source = require("vinyl-source-stream");
var gunzip = require("gulp-gunzip");
var untar = require("gulp-untar");
var gulpFilter = require("gulp-filter");
var merge2 = require("merge2");


gulp.task("default",
    ["jshint", "jsonlint", "htmlhint", "jscs", "coffeelint", "csslint", "requirejs", "requirejs-text", "spromise"],
    function () {
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

gulp.task("requirejs-text", function () {
    return gulp.src("./node_modules/requirejs-text/text.js")
        .pipe(gulp.dest("./libs/js/"));
});

gulp.task("spromise", function () {
    return gulp.src("./node_modules/spromise/dist/spromise.min.js")
        .pipe(rename("spromise.js"))
        .pipe(gulp.dest("./libs/js/"));
});

gulp.task("csslint", function() {
    var csslint = request("https://github.com/CSSLint/csslint/tarball/f69cf12e2")
        .pipe(source("*.tar.gz"))
        .pipe(gunzip())
        .pipe(untar())
        .pipe(gulpFilter(["**/release/csslint.js"]))
        .pipe(rename("csslint.js"));

    var htmlhint = gulp.src(["./node_modules/htmlhint/lib/htmlhint.js"]);

    return merge2(csslint, htmlhint)
           .pipe(gulp.dest("./plugins/default/csslint/libs"));
});
