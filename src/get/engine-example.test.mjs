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
import * as Engine from './engine-example'
import fs from 'fs'
import del from 'del'
import makeDir from 'make-dir'
/* -imports */

const initData = async () => {
  const sourceURL = new URL('https://www.example.com')
  const prefix = '__tmp__/engine-example__simple/'
  await del(prefix)
  await makeDir(`${prefix}00 Chapter One`)
  const write = (fname, data) => {
    fs.writeFileSync(`${prefix}${fname}`, data)
  }
  write('index.json', JSON.stringify({
    sourceURL,
    volumes: [
      {
        'title': 'Chapter One'
      }
    ],
    chapters: [
      {
        title: 'Description',
        integrity: 'start',
        volume: 0,
        files: [{
          fname: '000 Description.txt',
          integrity: undefined
        }]
      }
    ]
  }, null, 1))
  write('00 Chapter One/000 Description.txt', 'Hello World!')
}

test('simple', async () => {
  const prefix = '__tmp__/engine-example__simple/'
  await initData()
  const series = new Engine.Series({
    source: prefix
  })
  series.refresh()
})
