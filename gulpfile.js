/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
 
var gulp = require('gulp'),
  del = require('del'),
  ts = require('gulp-typescript'),
  typescript = require('typescript'),
  merge = require('merge2'),
  dts = require('dts-bundle'),
  watch = require('gulp-watch'),
  rename = require('gulp-rename'),
  replace = require('gulp-replace'),
  sequence = require('gulp-sequence'),
  options = require('./cu-build.config');

var jsOutput, tsdOutput;
if (options.publish) {
  jsOutput = options.publish.jsOutput || './lib/js';
  tsdOutput = options.publish.tsdOutput || './lib/definitions';
} else {
  jsOutput = './lib/js';
  tsdOutput = './lib/definitions';
}

function compileTS() {
  var tsProject = ts.createProject('tsconfig.json', {
    typescript: typescript,
    declarationFiles: true
  });
  var result = gulp.src('./src/ts/**/*.ts').pipe(ts(tsProject))

    return merge([
      result.js.pipe(gulp.dest(jsOutput)),
      result.dts
        .pipe(replace('\'../src', '\'../../src'))
        .pipe(gulp.dest(tsdOutput))
    ]);
}

function bundleDTS() {
  dts.bundle({
    name: options.name,
    main: tsdOutput + '/main.d.ts'
  });
  gulp.src(tsdOutput + '/' + options.name + '.d.ts')
    .pipe(rename(options.name + '.d.ts'))
    .pipe(gulp.dest(jsOutput));
}

function build(cb) {
  sequence('compileTS', 'bundleDTS')(cb);
}

function watchBuild() {
  gulp.watch('./ts/**/*.ts', build);
  return build();
}

function clean(cb) {
  del([jsOutput, tsdOutput], cb);
}

gulp.task('clean', clean);
gulp.task('compileTS', compileTS);
gulp.task('bundleDTS', bundleDTS);
gulp.task('watch', ['clean'], watchBuild);
gulp.task('build', ['clean'], build);
gulp.task('default', ['build', 'clean'])
