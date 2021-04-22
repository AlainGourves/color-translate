const gulp = require('gulp');
const sass = require('gulp-dart-sass');
const rename = require('gulp-rename');
//const pipeline = require('readable-stream').pipeline;
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();

const reload = browserSync.reload;
sass.compiler = require('sass'); // pour avoir dart-sass (et pouvoir utiliser @use)

// CSS
// Achtung ! le 'rename' doit être placé là sinon pas de source map
function style() {
    return gulp.src('./scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        // .pipe(rename('./sty.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./css'));
}

// Watch
// server: true     => serve files from the current directory
// open: false      => stop the browser from automatically opening
function watch() {
    browserSync.init({
        server: true,
        open: false
    });
    gulp.watch('./scss/**/*.scss', style)
    gulp.watch('./*.html').on('change', reload);
    gulp.watch('./js/**/*.js').on('change', reload);
};

exports.default = watch;