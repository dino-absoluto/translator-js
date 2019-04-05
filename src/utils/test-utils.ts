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
import del from 'del'
import makeDir = require('make-dir')

/* code */
export const __TMPDIR = path.resolve('__tmp__/jest/')
export const setupTmpDir = (name: string) => {
  const fpath = path.join(__TMPDIR, name)
  beforeAll(async () => {
    await del(path.join(fpath, '*'))
    await makeDir(fpath)
  })
  return fpath
}

export const hashDir = async (
  patt: string | ReadonlyArray<string>,
  options: GlobbyOptions
) => {
  let files = await globby(patt, options)
  files = files.sort()
  const cwd = options.cwd || path.resolve('.')
  const arrays = await Promise.all(files.map(async (fname: string) => {
    let content = await hasha.fromFile(fname, {
      encoding: 'base64'
    })
    return {
      fname: path.posix.normalize(path.relative(cwd, fname)),
      content
    }
  }))
  const data: { [id: string]: string } = {}
  for (const { fname, content } of arrays) {
    data[fname] = content || ''
  }
  return data
}

export const hash = async (data: any) => {
  let text: string
  if (typeof data === 'string') {
    text = data
  } else {
    text = JSON.stringify(data)
  }
  return hasha(text, {
    encoding: 'base64'
  })
}
