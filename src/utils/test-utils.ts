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
/* imports */
import globby, { GlobbyOptions } from 'globby'
import hasha = require('hasha')
import * as path from 'path'
/* -imports */

export const hashDir = async (
  patt: string | ReadonlyArray<string>,
  options: GlobbyOptions
) => {
  let files = await globby(patt, options)
  files = files.sort()
  const cwd = options.cwd || path.resolve('.')
  const arrays = await Promise.all(files.map(async (fname: string) => {
    let content = await (hasha as any).fromFile(fname, {
      encoding: 'base64'
    })
    return {
      fname: path.relative(cwd, fname),
      content
    }
  }))
  const data: { [id: string]: string } = {}
  for (const { fname, content } of arrays) {
    data[fname] = content
  }
  return data
}
