/**
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
/* import */
import got from 'got'
import hasha from 'hasha'
import path from 'path'
import makeDir from 'make-dir'
import fs from 'fs'
import stringify from 'json-stringify-safe'
import filenamify from 'filenamify'
/* -import */

export default async (url, ...options) => {
  const cacheDir = path.resolve('__cache__')
  const hash = hasha(JSON.stringify(options))
  const cacheFile = path.join(cacheDir, filenamify(url.toString()) + hash)
  try {
    let data = fs.readFileSync(cacheFile, 'utf8')
    data = JSON.parse(data)
    return data
  } catch (err) {
    console.log('got', url)
    let data = await got(url, ...options)
    makeDir.sync(path.dirname(cacheFile))
    fs.writeFileSync(cacheFile, stringify(data))
    return data
  }
}
