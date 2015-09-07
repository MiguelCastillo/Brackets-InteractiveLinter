/*eslint-env node */
var gulp = require("gulp");
var rename = require("gulp-rename");
var request = require("request");
var source = require("vinyl-source-stream");
var gunzip = require("gulp-gunzip");
var untar = require("gulp-untar");
var gulpFilter = require("gulp-filter");
var merge2 = require("merge2");
var run = require("gulp-run");
var install = require("gulp-install");

gulp.task("default",
    ["jshint", "jsonlint", "htmlhint", "jscs", "coffeelint", "csslint", "requirejs", "requirejs-text", "spromise", "eslint", "belty"],
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
    var coffeeScript = gulp.src("./node_modules/coffee-script")
        .pipe(gulpFilter(["**/extras/coffee-script.js"]))
        .pipe(rename("coffee-script-1.9.1.js"));

    var coffeelint = gulp.src("./node_modules/coffeelint/lib/coffeelint.js");

    return merge2(coffeeScript, coffeelint)
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
    var csslint = gulp.src("https://github.com/CSSLint/csslint/tarball/v0.10.0")
        .pipe(source("*.tar.gz"))
        .pipe(gunzip())
        .pipe(untar())
        .pipe(gulpFilter(["**/release/csslint.js"]))
        .pipe(rename("csslint.js"));

    var htmlhint = gulp.src(["./node_modules/htmlhint/lib/htmlhint.js"]);

    return merge2(csslint, htmlhint)
           .pipe(gulp.dest("./plugins/default/csslint/libs"));
});

gulp.task("eslint", ["eslint:install-dev-dependencies"], function (cb) {
    return gulp.src("./node_modules/eslint/build/eslint.js")
        .pipe(gulp.dest("./plugins/default/eslint/libs"));
});

gulp.task("eslint:build", ["eslint:install-dev-dependencies"], function (cb) {
    run("cd ./node_modules/eslint && npm run browserify").exec();
});

gulp.task("eslint:install-dev-dependencies", function () {
    return gulp.src("./node_modules/eslint/package.json")
        .pipe(install());
});

gulp.task("belty", function () {
    return gulp.src("./node_modules/belty/dist/index.js")
        .pipe(rename("belty.js"))
        .pipe(gulp.dest("./libs/js/"));
});
