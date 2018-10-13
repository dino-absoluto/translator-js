/**
 * @file index.js
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
/* config */
const config = {
  version: require('../package.json').version,
  sourceDir: __dirname
}

config.usage =
`
Usage: app.js [--output=<path>] [<URL> | <path>]

--help, -h      Print this text
--version, -v   Print the version and exit
--output, -o    Set output directory
--force, -f     Overwrite existing files
`

module.exports = config
