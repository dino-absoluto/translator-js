/**
 * @file index.js
 * @license
 * This file is part of novel-js.
 *
 * novel-js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * novel-js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with novel-js.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
/* Imports */

/* Local data */
const _engines = [
  require('./syosetu')
]

const _selectEngine = url => {
  for (const engine of _engines) {
    if (engine.test(url)) {
      return engine
    }
  }
}

module.exports = _selectEngine
