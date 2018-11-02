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
import Syosetu from '../engine-syosetu'
import path from 'path'
import del from 'del'
import makeDir from 'make-dir'
import * as utils from 'test-utils'
/* -imports */

utils.setupChdir('__tmp__/tests/syosetu')

test('get twice', async () => {
  const testURL = 'https://ncode.syosetu.com/n8201cq/'
  const prefix = 'double-get/'
  await del(prefix)
  await makeDir(prefix)
  {
    let source = new Syosetu({
      chdir: prefix,
      source: testURL
    })
    expect(source.targetDir).toBe(path.resolve(prefix, 'ncode.syosetu.com!n8201cq'))
    await source.refresh()
  }
  {
    let source = new Syosetu({
      chdir: prefix,
      source: testURL
    })
    expect(source.targetDir).toBe(path.resolve(prefix, 'ncode.syosetu.com!n8201cq'))
    source = await source.refresh()
    expect(source.targetDir).toBe(path.resolve(prefix, 'ncode.syosetu.com!n8201cq'))
    expect(await utils.globshot(prefix)).toMatchSnapshot()
  }
}, 60000 * 2)

test('get long series', async () => {
  const testURL = 'https://ncode.syosetu.com/n0537cm/'
  const prefix = `get-long/`
  // await del(prefix)
  await makeDir(prefix)
  let source = new Syosetu({
    chdir: prefix,
    source: testURL
  })
  expect(source.targetDir).toBe(path.resolve(prefix, 'ncode.syosetu.com!n0537cm'))
  source = await source.refresh()
  expect(source.targetDir).toBe(path.resolve(prefix, 'ncode.syosetu.com!n0537cm'))
  expect(await utils.globshot(prefix)).toMatchSnapshot()
}, 60000 * 5)
