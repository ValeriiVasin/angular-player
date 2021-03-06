var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var csso = require('gulp-csso');
var ngHtml2Js = require("gulp-ng-html2js");
var minifyHtml = require("gulp-minify-html");
var livereload = require('gulp-livereload');
var rename = require('gulp-rename');
var merge = require('merge-stream');
var gulpif = require('gulp-if');
var cssBase64 = require('gulp-css-base64');
var clean = require('gulp-clean');

/**
 * Helper that saves 2 versions of files:
 * concatenated and minified
 * Also it replaces images with base64-encoded data URI strings in css files
 */
function twoVersions(stream, filename) {
  var type = /\.js$/.test(filename) ? 'js' : 'css';

  return stream
    .pipe(concat(filename))
    .pipe(gulpif(type === 'css', cssBase64()))
    .pipe(gulp.dest('build/'))

    .pipe(gulpif(type === 'js', uglify()))
    .pipe(gulpif(type === 'css', csso()))

    .pipe(gulpif(type === 'js', rename({ extname: '.min.js' })))
    .pipe(gulpif(type === 'css', rename({ extname: '.min.css' })))

    .pipe(gulp.dest('build/'));
}

gulp.task('core', function () {
  return twoVersions(gulp.src('core/*.js'), 'core.js');
});

function simplePlayerJS() {
  var html2js = gulp.src('simple-player/*.html')
    .pipe(minifyHtml({
        empty: true,
        spare: true,
        quotes: true
    }))
    .pipe(ngHtml2Js({
        moduleName: "Player.Templates"
    }));

  var scripts = gulp.src([
    'core/*.js',
    'simple-player/js/*.js'
  ]);

  // prepare two versions of js files
  return merge(html2js, scripts)
    .pipe(concat('player.js'))
    .pipe(gulp.dest('build/'));
}

gulp.task('simple-player-js', function () {
  // minified version
  return simplePlayerJS().pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('build/'));
});

gulp.task('simple-player-js-full', function () {
  var deps = gulp.src([
    'bower_components/jquery-ui/ui/core.js',
    'bower_components/jquery-ui/ui/widget.js',
    'bower_components/jquery-ui/ui/mouse.js',
    'bower_components/jquery-ui/ui/slider.js'
  ]);

  // full
  return merge(simplePlayerJS(), deps)
    .pipe(concat('player-full.js'))
    .pipe(gulp.dest('build/'))

    // full minified
    .pipe(rename({ extname: '.min.js' }))
    .pipe(uglify())
    .pipe(gulp.dest('build/'));
});

gulp.task('simple-player-css', function () {

  // prepare two versions of css files
  return twoVersions(
    gulp.src([
      'simple-player/css/reset.css',
      'simple-player/css/player.css'
    ]),
    'player.css'
  );
});

gulp.task('simple-player', [
  'simple-player-js',
  'simple-player-js-full',
  'simple-player-css'
  ]);

gulp.task('watch', function () {
  livereload.listen();
  gulp.watch('core/*.js', ['core']);
  gulp.watch('simple-player/**', ['simple-player']);

  gulp.watch(['build/**', 'examples/**'])
    .on('change', livereload.changed);
});

gulp.task('build', ['core', 'simple-player']);

gulp.task('dist-clean', function () {
  return gulp.src('dist/*', { read: false })
    .pipe(clean());
});

gulp.task('dist', ['build', 'dist-clean'], function () {
  gulp.src('build/*')
    .pipe( gulp.dest('dist/') );
});
