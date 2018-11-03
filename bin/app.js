#!/usr/bin/env node
/**
 * @file app.js
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
const chalk = require('chalk')

const isDev = process.env.NODE_ENV !== 'production'
if (isDev) {
  try {
    require('../__tmp__/dist/app')
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      console.error(chalk`{red ${err.stack}}`)
    }
    console.log(chalk`{blue Development mode: fallback}`)
    require('../dist/app.min')
  }
} else {
  require('../dist/app.min')
}
/* -imports */
