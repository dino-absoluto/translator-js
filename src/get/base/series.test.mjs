/**
 * @file Get module
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
import Series from './series'
import makeDir from 'make-dir'
import del from 'del'
import fs from 'fs'
import path from 'path'
/* -imports */

test('init with url', () => {
  const sourceURL = new URL('https://www.example.com')
  let ss = new Series({
    source: sourceURL
  })
  expect(ss.sourceURL).toEqual(sourceURL)
  expect(ss.targetDir).toBe(path.resolve('www.example.com'))
  expect(ss).toEqual({
    sourceURL
  })
})

test('init chdir', () => {
  const sourceURL = new URL('https://www.example.com')
  let ss = new Series({
    chdir: '__tmp__',
    source: sourceURL
  })
  expect(ss.sourceURL).toEqual(sourceURL)
  expect(ss.targetDir).toBe(path.resolve('__tmp__/www.example.com'))
})

test('init with path', async () => {
  await makeDir('./__tmp__/')
  process.chdir('./__tmp__/')
  await del('series/simple')
  await makeDir('series/simple')
  const sourceURL = new URL('https://www.example.com')
  fs.writeFileSync('series/simple/index.json', JSON.stringify({
    sourceURL
  }, null, 1))
  let ss = new Series({
    source: 'series/simple'
  })
  expect(ss.sourceURL).toEqual(sourceURL)
  expect(ss.targetDir).toBe(path.resolve('series/simple'))
  expect(ss).toEqual({
    sourceURL
  })
})
