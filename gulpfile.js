const gulp = require('gulp');
const sass = require('gulp-dart-sass');
const rename = require('gulp-rename');
//const pipeline = require('readable-stream').pipeline;
const sourcemaps = require('gulp-sourcemaps');

sass.compiler = require('sass');

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

function watch() {
    gulp.watch('./scss/**/*.scss', style)
};

exports.default = watch;