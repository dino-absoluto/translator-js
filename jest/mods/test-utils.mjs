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
/* eslint-env jest */
/* imports */
import path from 'path'
import globby from 'globby'
import hasha from 'hasha'
import makeDir from 'make-dir'
/* -imports */

export const globshot = async (...argv) => {
  let files = await globby(...argv)
  files = files.sort()
  files = files.map(async fname => {
    let content = await hasha.fromFile(fname, {
      encoding: 'base64'
    })
    return {
      fname,
      content
    }
  })
  files = await Promise.all(files)
  return files
}

export const setupChdir = (fname) => {
  const __rootDir = process.cwd()
  const __tmpdir = path.resolve(fname)
  beforeEach(() => {
    makeDir.sync(__tmpdir)
    process.chdir(__tmpdir)
  })
  afterEach(() => {
    process.chdir(__rootDir)
  })
}
