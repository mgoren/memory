var gulp = require('gulp');

// build stuff
var utilities = require('gulp-util'); // for environment variables (--production)
var del = require('del'); // for cleaning up build folders

// development server stuff (for live reload)
var browserSync = require('browser-sync').create(); // development server (for live reload)

// js workflow stuff
var concat = require('gulp-concat'); // concat before browersify
var browserify = require('browserify'); // browserify concatenated -interface.js files
var source = require('vinyl-source-stream'); // required for browserify
var uglify = require('gulp-uglify'); // for optional minification
var jshint = require('gulp-jshint'); // jshint

// sass stuff
var sass = require('gulp-sass'); // sass
var sourcemaps = require('gulp-sourcemaps'); // required for sass

// bower stuff
var lib = require('bower-files')({
  "overrides":{
    "bootstrap" : {
      "main": [
        "less/bootstrap.less",
        "dist/css/bootstrap.css",
        "dist/js/bootstrap.js"
      ]
    }
  }
});


// shortcut to run build & serve
gulp.task('go', ['build'], function() {
  gulp.start('serve');
});


// ------------------------------------ main build tasks ----------------------------------

var buildProduction = utilities.env.production; // check if production environment variable exists

gulp.task("build", ['clean'], function(){
  if (buildProduction) {
    gulp.start('minifyScripts');
  } else {
    gulp.start('jsBrowserify');
  }
  gulp.start('bower');
  gulp.start('scssConvert');
  gulp.start('jshint');
});

gulp.task("clean", function(){
  return del(['build', 'tmp']);
});


// --------------------------------- development server tasks ------------------------------

gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: "./",
      index: "index.html"
    }
  });
  gulp.watch(['*.html'], ['htmlBuild']);
  gulp.watch(['js/*.js'], ['jsBuild']);
  gulp.watch(['bower.json'], ['bowerBuild']);
  gulp.watch("scss/*.scss", ['cssBuild']);
});

gulp.task('htmlBuild', function(){
  browserSync.reload();
});

gulp.task('jsBuild', ['jsBrowserify', 'jshint'], function(){
  browserSync.reload();
});

gulp.task('cssBuild', ['scssConvert'], function(){
  browserSync.reload();
});

gulp.task('bowerBuild', ['bower'], function(){
  browserSync.reload();
});


// ----------------- concatenate and browserify js files tasks -----------------------

// concatenate js/*-interface.js together into tmp/allConcat.js (which will then be browserified)
gulp.task('concatInterface', function() {
  return gulp.src(['./js/*-interface.js'])
    .pipe(concat('allConcat.js'))
    .pipe(gulp.dest('./tmp'));
});

// browserify tmp/allConcat.js (which is the concatenated version of all -interface.js files)
// make build/js/app.js file, which is our browserified js
// (note that back-end files are brought in by require statements in the -interface.js files)
gulp.task('jsBrowserify', ['concatInterface'] , function() {
  return browserify({ entries: ['./tmp/allConcat.js'] })
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('./build/js'));
});

// optional minification task
// run instead of jsBrowserify for production builds, since this calls jsBrowserify before minifying
gulp.task("minifyScripts", ["jsBrowserify"], function(){
  return gulp.src("./build/js/app.js")
    .pipe(uglify())
    .pipe(gulp.dest("./build/js"));
});

// run JSHint on all js files
gulp.task('jshint', function(){
  return gulp.src(['js/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});


// -------------------------------------- scss conversion ----------------------------

// convert *.scss -> build/css/____.css (will be run by gulp build & by server watcher)
gulp.task('scssConvert', function() {
  return gulp.src('scss/*.scss')
    .pipe(sourcemaps.init()) 
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build/css'));
});


// ----------------------------- build vendor js & css (bower tasks) ----------------------------

// shortcut to run bowerJS & bowerCSS (will be run by gulp build & by server watcher)
gulp.task('bower', ['bowerJS', 'bowerCSS']);

// concatenate & minify all bower js (e.g. jquery, bootstrapJS) -> build/js/vendor.min.js
gulp.task('bowerJS', function () {
  return gulp.src(lib.ext('js').files)
    .pipe(concat('vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'));
});

// concatenate all bower css (e.g. bootstrap) -> build/css/vendor.css
gulp.task('bowerCSS', function () {
  return gulp.src(lib.ext('css').files)
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('./build/css'));
});



