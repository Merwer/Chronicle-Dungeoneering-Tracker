var gulp = require('gulp'),
    qunit = require('gulp-qunit');

gulp.task('default', function() {
    return gulp.src('./tests/unit/test-js.html')
        .pipe(qunit());
});