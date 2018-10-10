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
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import del from 'del'
import pkg from './package.json'
import builtinModules from 'builtin-modules'
/* gulp */

const external = Object.keys(pkg.dependencies).concat(builtinModules)

export const clean = async () => {
  await del('bin/')
  await del('__tmp__/')
}

export const scripts = async () => {
  const bundle = await rollup({
    input: './src/index.mjs',
    external,
    plugins: [
      resolve({
        preferBuiltins: true,
        only: [ /(.|..)\/.+$/ ]
      }),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  })
  await bundle.write({
    file: './dist/app.js',
    format: 'cjs',
    name: 'app',
    sourcemap: true
  })
}

export const watch = () => {
  gulp.watch('src/**/*.(js|mjs|jsx)', scripts)
}

export default scripts
