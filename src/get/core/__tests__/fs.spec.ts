/**
 * @author Dino <dinoabsoluto+dev@gmail.com>
 * @license
 * Copyright 2019 Dino <dinoabsoluto+dev@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/* imports */
import { Folder } from '../fs'
import * as path from 'path'
import * as fs from 'fs'
import { setup } from '../../../utils/test-utils'

/* setup */
const { __TMPDIR } = setup(__filename)

/* code */
describe('Folder', () => {
  const tmpDir = new Folder(null, path.join(__TMPDIR, 'Folder'))
  expect(tmpDir.path).toBe(__TMPDIR + '/Folder')
  const TMPPATH = tmpDir.path
  test('constructor.2', async () => {
    const name = 'cont1'
    const testPath = path.join(TMPPATH, name)
    const cont = new Folder(null, testPath)
    expect(cont.renameable).toBeFalsy()
    expect(() => fs.accessSync(testPath)).toThrow('ENOENT')
    await expect(cont.rename(name + '-renamed'))
      .rejects.toThrow('cannot be renamed')
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
    await cont.real()
    expect(() => fs.accessSync(testPath + '-renamed')).not.toThrow()
  })
})

describe('File', () => {
  const tmpDir = new Folder(null, path.join(__TMPDIR, 'File'))
  const TMPPATH = tmpDir.path
  test('constructor()', async () => {
    const name = 'constructor.txt'
    const testPath = path.join(TMPPATH, name)
    const file = tmpDir.requestFile(name)
    expect(file.path).toBe(testPath)
  })
  test('simple manipulation', async () => {
    const name = 'simple.txt'
    const testPath = path.join(TMPPATH, name)
    const file = tmpDir.requestFile(name)
    expect(file.path).toBe(testPath)
    await file.real()
    await file.rename('access-renamed.txt')
    await file.remove()
  })
  test('simple write-read', async () => {
    const name = 'wr.txt'
    const testPath = path.join(TMPPATH, name)
    const file = tmpDir.requestFile(name)
    expect(file.path).toBe(testPath)
    await file.write('Hello World!')
    await expect(file.read()).resolves.toEqual(Buffer.from('Hello World!'))
  })
  test('simple read-write-read', async () => {
    const name = 'rwr.txt'
    const testPath = path.join(TMPPATH, name)
    const file = tmpDir.requestFile(name)
    expect(file.path).toBe(testPath)
    await expect(file.read()).rejects.toThrow('ENOENT')
    await file.write('Hello World!')
    await expect(file.read()).resolves.toEqual(Buffer.from('Hello World!'))
    await expect(file.read()).resolves.toEqual(Buffer.from('Hello World!'))
    await file.remove()
    await expect(file.read()).rejects.toThrow('filename is not set')
  })
})
