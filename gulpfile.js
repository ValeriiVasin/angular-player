var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ngHtml2Js = require("gulp-ng-html2js");
var minifyHtml = require("gulp-minify-html");
var livereload = require('gulp-livereload');

gulp.task('concat', function() {
  gulp.src('js/*.js')
    .pipe(concat('player.js'))
    .pipe(gulp.dest('build/'));
});

gulp.task('uglify', function () {
  gulp.src('js/*.js')
    .pipe(concat('player.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/'));
});

gulp.task('templates', function () {
  gulp.src('*.html')
    .pipe(minifyHtml({
        empty: true,
        spare: true,
        quotes: true
    }))
    .pipe(ngHtml2Js({
        moduleName: "Player.Templates"
    }))
    .pipe(concat("templates.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("build/"));
});

gulp.task('watch', function () {
  livereload.listen();
  gulp.watch('player.html', ['templates']);
  gulp.watch('js/*.js', ['concat']);

  gulp.watch(['build/**', 'example/**', 'css/**'])
    .on('change', livereload.changed);
});
