var fs = require('fs');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var templateCache = require('gulp-angular-templatecache');
var streamqueue = require('streamqueue');

gulp.task('minify', function() {
  var files = JSON.parse(fs.readFileSync('sources.json', 'utf-8'));
  var stream = streamqueue({objectMode: true},
    gulp.src(['src/templates/**/*.html']).pipe(templateCache({
      standalone: true,
      root: 'src/templates/'
    })),
    gulp.src(files)
  )
  .pipe(concat('asf-addon.js'))
  .pipe(gulp.dest('./dist'))
  .pipe(uglify())
  .pipe(rename('asf-addon.min.js'))
  .pipe(gulp.dest('./dist'));

  return stream;
});
