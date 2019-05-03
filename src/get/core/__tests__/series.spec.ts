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
import { hashDir, setup } from '../../../utils/test-utils'
import { Series } from '../series'
import { getNovel } from '../../providers'
import * as path from 'path'
import * as fs from 'fs'
import makeDir = require('make-dir')

/* setup */
const { __TMPDIR } = setup(__filename, {
  network: true
})

/* code */
describe('Series', () => {
  const href = new URL('http://ncode.syosetu.com/n0537cm/')
  const title = '邪神アベレージ'
  test('constructor.1', async () => {
    const outputDir = path.join(__TMPDIR, 'constructor.1')
    const series = new Series({
      novel: await getNovel(href),
      outputDir,
      data: {
        id: 'n0537cm',
        name: title
      }
    })
    expect(() => series.container.path).not.toThrow()
    await series.ready
    expect(series.data.name).toBe('邪神アベレージ')
    expect(series.container.path).toBe(path.join(outputDir, title))
  })
  test('constructor.2', async () => {
    const outputDir = path.join(__TMPDIR, 'constructor.2')
    const expectedDir = path.join(outputDir, title)
    await makeDir(expectedDir)
    fs.copyFileSync(
      path.join(__dirname, 'testdata/index.json'),
      path.join(expectedDir, 'index.json'))
    const series = new Series({
      novel: await getNovel(href),
      outputDir,
      data: {
        id: 'n0537cm',
        name: title
      }
    })
    expect(() => series.container.path).not.toThrow()
    await series.ready
    expect(series.data).toEqual(expect.objectContaining({
      name: '邪神アベレージ',
      author: '北瀬野ゆなき',
      genre: 'ハイファンタジー',
      status: { completed: true, size: 82 }
    }))
    expect(series.container.path).toBe(expectedDir)
  })
  test('constructor.3', async () => {
    const outputDir = path.join(__TMPDIR, 'constructor.3')
    const series = new Series({
      sourceURL: href.toString(),
      outputDir,
      data: {
        id: 'n0537cm',
        name: title
      }
    })
    expect(() => series.container.path).not.toThrow()
    await series.ready
    expect(series.data.name).toBe('邪神アベレージ')
    expect(series.container.path).toBe(path.join(outputDir, title))
  })
  test('serialize()', async () => {
    const outputDir = path.join(__TMPDIR, 'serialize()')
    const series = new Series({
      novel: await getNovel(href),
      outputDir
    })
    await series.ready
    expect(series.data).toEqual(expect.objectContaining({
      id: 'n0537cm',
      over18: false
    }))
    expect(() => series.container.path).toThrow()
  })
  test('update()', async () => {
    const outputDir = path.join(__TMPDIR, 'update')
    const series = new Series({
      novel: await getNovel(href),
      outputDir
    })
    await series.ready
    expect(() => series.container.path).toThrow()
    await series.update()
    expect(series.data).toEqual(expect.objectContaining({
      name: '邪神アベレージ',
      author: '北瀬野ゆなき',
      genre: 'ハイファンタジー',
      status: { completed: true, size: 82 }
    }))
  })
  test.each([
    new URL('http://ncode.syosetu.com/n0537cm/'),
    new URL('https://kakuyomu.jp/works/1177354054880848824')
  ])('updateIndex()', async (href) => {
    const outputDir = path.join(__TMPDIR, 'updateIndex')
    const series = new Series({
      novel: await getNovel(href),
      outputDir
    })
    await series.ready
    expect(() => series.container.path).toThrow()
    await series.updateIndex()
    expect(await hashDir(path.join(outputDir, '**/*'), {
      cwd: outputDir
    })).toMatchSnapshot()
  }, 120000)
})
