/**
 * Created by Administrator on 2016/10/12.
 */
const gulp = require('gulp');
const less = require('gulp-less');
const cleancss = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const LessPluginAutoPrefix = require('less-plugin-autoprefix');//css自动编译私有前缀
const autoprefix = new LessPluginAutoPrefix({ browsers: ["ie >= 8", "ie_mob >= 10", "ff >= 26", "chrome >= 30", "safari >= 6", "opera >= 23", "ios >= 5", "android >= 2.3", "bb >= 10"] });

gulp.task('css',function(){
    gulp.src('build/less/*.less')
        .pipe(sourcemaps.init())
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(less({ plugins: [autoprefix] }))
        .pipe(cleancss())
        .pipe(rename(function(path){
            path.extname = '.min.css'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/css'))
});

gulp.task('js',function(){
    gulp.src('build/js/*.js')
        .pipe(sourcemaps.init({identityMap:true}))
        .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
        .pipe(uglify({compress:false}))
        .pipe(rename(function(path){
            path.extname = '.min.js'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/js'))
})

gulp.task('watch',function(){
    gulp.watch('build/less/*.less',['css']);
    gulp.watch('build/js/*.js',['js']);
});

gulp.task('default',['css','js','watch']);
