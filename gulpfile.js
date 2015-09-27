var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();

var sassDir = './assets/sass/*.scss';

    gulp.task('sass', function() {
    gulp.src(sassDir)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./assets/stylesheets/'))

});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
});


gulp.task('watch', function() {
    gulp.watch(sassDir, ['sass']);
});

gulp.task('default', ['watch', 'sass', 'browser-sync']);
