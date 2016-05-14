var gulp = require('gulp');
var mocha = require('gulp-mocha');
var eslint = require('gulp-eslint');

var app = require('./tests/app.js');
app.listen(1337);

gulp.task('lint', function() {
  return gulp.src(['tests/app.js', '!node_modules/**'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
})

gulp.task('mocha', ['lint'], function () {
  return gulp.src('tests/app.spec.js')
  .pipe(mocha())
  .once('end', function() {
    process.exit();
  });
})

gulp.task('default', ['mocha']);
