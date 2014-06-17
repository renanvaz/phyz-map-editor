// npm install --save-dev gulp gulp-concat gulp-uglify gulp-less gulp-minify-css
var gulp        = require('gulp'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglify'),
    less        = require('gulp-less'),
    minify      = require('gulp-minify-css');

var paths = {
    scripts: ['src/js/phyz-map-editor.js'],
    css: ['src/less/phyz-map-editor.less'],
};

gulp.task('scripts', function() {
    return gulp.src(paths.scripts)
        .pipe(uglify())
        .pipe(concat('phyz-map-editor.min.js'))
        .pipe(gulp.dest('media/js'));
});

gulp.task('css', function() {
    return gulp.src(paths.css)
        .pipe(less())
        .pipe(minify())
        .pipe(concat('phyz-map-editor.min.css'))
        .pipe(gulp.dest('media/css'));
});

// Rerun the task when a file changes
gulp.task('watch', function () {
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.css, ['css']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['scripts', 'css', 'watch']);
