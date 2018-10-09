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
import fs from 'fs'
/* -imports */

test('init with url', () => {
  const url = new URL('https://www.example.com')
  let ss = new Series({
    source: url
  })
  expect(ss.url).toEqual(url)
  expect(ss).toEqual({
    url
  })
})

test('init with path', async () => {
  await makeDir('./__tmp__/series/simple')
  process.chdir('./__tmp__/')
  const url = new URL('https://www.example.com')
  fs.writeFileSync('series/simple/index.json', JSON.stringify({
    url
  }, null, 1))
  let ss = new Series({
    source: 'series/simple'
  })
  expect(ss.url).toEqual(url)
  expect(ss).toEqual({
    url
  })
})
