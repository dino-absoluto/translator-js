/**
 * @file Files management
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
import { Folder } from '../fs'
import * as path from 'path'
import * as fs from 'fs'
import del from 'del'
import makeDir = require('make-dir')
/* code */

const TMPDIR = path.resolve('__tmp__/jest-tmp/get/core-fs')

beforeAll(async () => {
  await del(path.join(TMPDIR, '*'))
  return makeDir(TMPDIR)
})

describe('Folder', () => {
  const tmpDir = new Folder(null, TMPDIR)
  test('constructor.0', async () => {
    expect(tmpDir.path).toBe(TMPDIR)
  })
  test('constructor.1', async () => {
    const name = 'cont1'
    const cont = new Folder(null, path.join(TMPDIR, name))
    expect(cont.renameable).toBeFalsy()
    expect(() => fs.accessSync(path.join(TMPDIR, name))).toThrow('ENOENT')
    await expect(cont.rename(name + '-renamed'))
      .rejects.toThrow('can\'t be renamed')
    expect(() => fs.accessSync(path.join(TMPDIR, name + '-renamed'))).toThrow('ENOENT')
  })
  test('constructor.2', async () => {
    const name = 'cont2'
    const cont = tmpDir.requestFolder(name)
    expect(cont.renameable).toBeTruthy()
    expect(() => fs.accessSync(path.join(TMPDIR, name))).toThrow('ENOENT')
    await expect(cont.rename(name + '-renamed'))
      .resolves.toBeUndefined()
    expect(() => fs.accessSync(path.join(TMPDIR, name + '-renamed'))).toThrow('ENOENT')
    await cont.access()
    expect(() => fs.accessSync(path.join(TMPDIR, name + '-renamed'))).not.toThrow()
  })
})
