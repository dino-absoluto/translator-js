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
// import Engine from './engine-example'
import fs from 'fs'
import del from 'del'
import makeDir from 'make-dir'
/* -imports */

const initData = async () => {
  const sourceURL = new URL('https://www.example.com')
  const prefix = '__tmp__/engine-example__simple/'
  await del(prefix)
  await makeDir(prefix)
  fs.writeFileSync(`${prefix}index.json`, JSON.stringify({
    sourceURL,
    volumes: [
      {
        'title': 'Chapter One'
      }
    ],
    chapters: [
      {
        title: 'Description',
        integrity: undefined,
        volume: 0,
        files: [{
          fname: '000 Description.txt',
          integrity: undefined
        }]
      }
    ]
  }, null, 1))
}

test('simple', async () => {
  await initData()
})
