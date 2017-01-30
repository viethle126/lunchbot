const gulp = require('gulp')
const mocha = require('gulp-mocha')
const app = require('./tests/app.js')

app.listen(1337)

gulp.task('mocha', () =>
  gulp.src('tests/app.spec.js')
    .pipe(mocha())
    .once('end', () => process.exit())
)

gulp.task('default', ['mocha'])
