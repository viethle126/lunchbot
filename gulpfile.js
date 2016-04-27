var gulp = require('gulp');
var mocha = require('gulp-mocha');
var eslint = require('gulp-eslint');
var nodemon = require('gulp-nodemon');

var app = require('./tests/app.js');
var server = '';

gulp.task('start', function() {
  server = app.listen(1337);
})

gulp.task('lint', ['start'], function() {
  return gulp.src(['tests/app.js', '!node_modules/**'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
})

gulp.task('mocha', ['lint'], function () {
  return gulp.src('tests/app.spec.js')
  .pipe(mocha())
})

gulp.task('test', ['mocha'], function() {
  server.close();
})

gulp.task('default', ['mocha'], function() {
  server.close();
  nodemon({ script: 'app.js' })
})
