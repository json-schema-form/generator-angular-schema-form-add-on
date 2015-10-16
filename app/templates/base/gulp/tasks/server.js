var gulp = require('gulp');
var connect = require('gulp-connect');

gulp.task('connect', function() {
  connect.server({
    root: ['test', './'],
    livereload: true
  });
});

gulp.task('reload', ['minify'], function() {
  gulp.src('./dist/**/*.*').pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch(['./src/**', './test/**'], ['reload']);
});
