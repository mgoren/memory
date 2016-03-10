var gulp = require('gulp');
var jshint = require('gulp-jshint');

// js workflow stuff
var concat = require('gulp-concat'); // concat before browersify
var browserify = require('browserify'); // browserify concatenated -interface.js files
var source = require('vinyl-source-stream'); // dependency of browserify
var uglify = require('gulp-uglify'); // for optional minification

// build stuff
var utilities = require('gulp-util'); // for environment variables (--production)
var del = require('del'); // for cleaning up build folders


// read --production environment variable if any
var buildProduction = utilities.env.production;



// --------------------------------- misc -----------------------------------

// jshint task
gulp.task('jshint', function(){
  return gulp.src(['js/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});



// ----------------- concatenate and browserify js files -----------------------

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


// -------------------------------------- build ----------------------------------------

gulp.task("build", ['clean'], function(){
  if (buildProduction) {
    gulp.start('minifyScripts');
  } else {
    gulp.start('jsBrowserify');
  }
  // gulp.start('bower');
  // gulp.start('cssBuild');
});

gulp.task("clean", function(){
  return del(['build', 'tmp']);
});
