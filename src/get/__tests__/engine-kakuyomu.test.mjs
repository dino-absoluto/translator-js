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
import Kakuyomu from '../engine-kakuyomu'
import path from 'path'
import del from 'del'
import makeDir from 'make-dir'
import * as utils from 'test-utils'
/* -imports */

utils.setupEnvironment({
  chdir: '__tmp__/tests/kakuyomu'
})

test('get', async () => {
  const testURL = 'https://kakuyomu.jp/works/1177354054883528580'
  const prefix = 'get/'
  const suffix = 'kakuyomu.jp!works!1177354054883528580'
  const absolute = path.resolve(prefix, suffix)
  await del(prefix)
  await makeDir(prefix)
  {
    let source = new Kakuyomu({
      chdir: prefix,
      source: testURL
    })
    expect(source.targetDir).toBe(absolute)
    source = await source.refresh()
    expect(source.targetDir).toBe(absolute)
    expect(await utils.hashDir(prefix)).toMatchSnapshot()
  }
}, 60000)
