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

const TMPDIR = path.resolve('__tmp__/jest-tmp/get__core-fs')

beforeAll(async () => {
  await del(path.join(TMPDIR, '*'))
  return makeDir(TMPDIR)
})

describe('Folder', () => {
  const tmpDir = new Folder(null, path.join(TMPDIR, 'Folder'))
  expect(tmpDir.path).toBe(TMPDIR + '/Folder')
  const TMPPATH = tmpDir.path
  beforeEach(async () => {
    await del(path.join(TMPPATH, '*'))
  })
  test('constructor.2', async () => {
    const name = 'cont1'
    const testPath = path.join(TMPPATH, name)
    const cont = new Folder(null, testPath)
    expect(cont.renameable).toBeFalsy()
    expect(() => fs.accessSync(testPath)).toThrow('ENOENT')
    await expect(cont.rename(name + '-renamed'))
      .rejects.toThrow('can\'t be renamed')
    expect(() => fs.accessSync(testPath + '-renamed')).toThrow('ENOENT')
  })
  test('requestFolder()', async () => {
    const name = 'cont2'
    const testPath = path.join(TMPPATH, name)
    const cont = tmpDir.requestFolder(name)
    expect(cont.renameable).toBeTruthy()
    expect(() => fs.accessSync(testPath)).toThrow('ENOENT')
    await expect(cont.rename(name + '-renamed'))
      .resolves.toBeUndefined()
    expect(() => fs.accessSync(testPath + '-renamed')).toThrow('ENOENT')
    await cont.access()
    expect(() => fs.accessSync(testPath + '-renamed')).not.toThrow()
  })
})

describe('File', () => {
  const tmpDir = new Folder(null, path.join(TMPDIR, 'File'))
  const TMPPATH = tmpDir.path
  beforeEach(async () => {
    await del(path.join(TMPPATH, '*'))
  })
  test('constructor()', async () => {
    const name = 'constructor.txt'
    const testPath = path.join(TMPPATH, name)
    const file = tmpDir.requestFile(name)
    expect(file.path).toBe(testPath)
  })
  test('simple manipulation', async () => {
    const name = 'access.txt'
    const testPath = path.join(TMPPATH, name)
    const file = tmpDir.requestFile(name)
    expect(file.path).toBe(testPath)
    await file.access()
    await file.rename('access-renamed.txt')
    await file.remove()
  })
  test('simple write-read', async () => {
    const name = 'access.txt'
    const testPath = path.join(TMPPATH, name)
    const file = tmpDir.requestFile(name)
    expect(file.path).toBe(testPath)
    await file.setData('Hello World!')
    await expect(file.getData()).resolves.toEqual(Buffer.from('Hello World!'))
  })
  test('simple read-write-read', async () => {
    const name = 'access.txt'
    const testPath = path.join(TMPPATH, name)
    const file = tmpDir.requestFile(name)
    expect(file.path).toBe(testPath)
    await expect(file.getData()).rejects.toThrow('ENOENT')
    await file.setData('Hello World!')
    await expect(file.getData()).resolves.toEqual(Buffer.from('Hello World!'))
    await expect(file.getData()).resolves.toEqual(Buffer.from('Hello World!'))
    await file.remove()
    await expect(file.getData()).rejects.toThrow('Filename is not set')
  })
})
