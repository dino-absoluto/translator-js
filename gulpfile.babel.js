/**
 * @file main.js
 * @author Dino <dinoabsoluto+dev@gmail.com>
 * @license
 * This file is part of translator-js.
 *
 * translator-js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * translator-js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with translator-js.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
/* imports */
import gulp from 'gulp'
import { rollup } from 'rollup'
import { terser } from 'rollup-plugin-terser'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import babel from 'rollup-plugin-babel'
import del from 'del'
import pkg from './package.json'
import clone from 'clone'
import builtinModules from 'builtin-modules'
/* gulp */

const external = Object.keys(pkg.dependencies).concat(builtinModules)
const __tmpdir = '__tmp__/dist/'
const __distdir = 'dist/'

export const clean = async () => {
  await del(__tmpdir)
}

const _js = async (isdev = true) => {
  const babelrc = clone(pkg.babel)
  Object.assign(babelrc, {
    babelrc: false,
    exclude: 'node_modules/**',
    plugins:
      babelrc.plugins.filter(mod => mod !== 'babel-plugin-dynamic-import-node')
  })
  const bundle = await rollup({
    onwarn: function (warn) {
      console.warn(warn)
    },
    input: './src/index.mjs',
    external,
    experimentalCodeSplitting: true,
    plugins: [
      resolve({
        preferBuiltins: true,
        only: [ /(.|..)\/.+$/ ]
      }),
      commonjs(),
      json(),
      babel(babelrc),
      (isdev ? undefined : terser())
    ]
  })
  await bundle.write({
    output: {
      exports: 'named'
    },
    entryFileNames: isdev
      ? 'app.js'
      : 'app.min.js',
    dir: isdev
      ? __tmpdir
      : __distdir,
    format: 'cjs',
    name: 'app',
    sourcemap: true
  })
}

export const js = async () => {
  return _js()
}

export const jsmin = async () => {
  await del(__distdir)
  return _js(false)
}

export const dist = jsmin

export const watch = () => {
  gulp.watch('src/**/*.(js|mjs|jsx)', js)
}

export default gulp.series(clean, js)
