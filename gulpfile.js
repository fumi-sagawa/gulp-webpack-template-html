//https://qiita.com/KazuyoshiGoto/items/3059c99330cdc19e97ad
//https://www.radia.jp/archives/1190

// 基本設定
const gulp = require("gulp");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
// scss
const sass = require("gulp-sass");
const sassGlob = require("gulp-sass-glob");
const postcss = require("gulp-postcss");
const objectFit = require("postcss-object-fit-images");
const mqpacker = require("css-mqpacker");
//pug
const pug = require("gulp-pug");
const autoprefixer = require("gulp-autoprefixer");
const replace = require("gulp-replace");
//image
const imagemin = require("gulp-imagemin");
const changed = require("gulp-changed");
const pngquant = require("imagemin-pngquant");
const mozjpeg = require("imagemin-mozjpeg");
//javascript
const webpackStream = require("webpack-stream");
const webpack = require("webpack");
const webpackConfig = require("./webpack.config");
//browser
const browserSync = require("browser-sync");

//setting : paths
const paths = {
  root: "./dist/",
  htmlSrc: "./src/html/**/*.html",
  htmlDist: "./dist/",
  cssSrc: "./src/scss/**/*.scss",
  cssDist: "./dist/css/",
  jsSrc: "./src/js/**/*.js",
  jsDist: "./dist/js/",
  imgSrc: "./src/img/**/*.{jpg,jpeg,png,gif,svg}",
  imgDist: "./dist/img/",
};

//gulpコマンドの省略
const { watch, series, task, src, dest, parallel } = require("gulp");

//Sass
task("sass", function () {
  return src(paths.cssSrc)
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(sassGlob())
    .pipe(
      sass({
        outputStyle: "expanded", // Minifyするなら'compressed'
      })
    )
    .pipe(
      autoprefixer({
        cascade: false,
        grid: "autoplace",
      })
    )
    .pipe(postcss([objectFit]))
    .pipe(postcss([mqpacker()]))
    .pipe(dest(paths.cssDist));
});

//html
task("html", function () {
  return (
    src([paths.htmlSrc])
      .pipe(
        plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
      )
      //正規表現にて相対・カレントパスの置き換え
      .pipe(replace(/src=".*?\/img\//g, 'src="./img/'))
      .pipe(dest(paths.htmlDist))
  );
});

//js
task("js", function () {
  return webpackStream(webpackConfig, webpack).pipe(gulp.dest(paths.jsDist));
});

//img
task("img", function () {
  return src(paths.imgSrc)
    .pipe(changed(paths.imgDist))
    .pipe(
      imagemin([
        pngquant({ quality: [0.7, 0.85], speed: 1 }),
        mozjpeg({ quality: 80 }),
        imagemin.svgo(),
        imagemin.gifsicle(),
      ])
    )
    .pipe(gulp.dest(paths.imgDist));
});

// browser-sync
task("browser-sync", () => {
  return browserSync.init({
    server: {
      baseDir: paths.root,
    },
    port: 8080,
    reloadOnRestart: true,
  });
});

// browser-sync reload
task("reload", (done) => {
  browserSync.reload();
  done();
});

//watch
task("watch", (done) => {
  watch([paths.cssSrc], series("sass", "reload"));
  watch([paths.jsSrc], series("js", "reload"));
  watch([paths.htmlSrc], series("html", "reload"));
  watch([paths.imgSrc], series("img", "reload"));
  done();
});

task("default", parallel("watch", "browser-sync"));
