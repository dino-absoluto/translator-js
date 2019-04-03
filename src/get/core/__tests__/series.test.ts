/**
 * @file Series
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
import { Series } from '../series'
import { getNovel } from '../../providers'
import { back as nockBack, NockBackContext } from 'nock'
import del from 'del'
import * as path from 'path'
/* code */

const TMPDIR = path.resolve('__tmp__/jest-tmp/get/core-series')
const OUTDIR = path.join(TMPDIR, 'output')
nockBack.setMode('record')
nockBack.fixtures = path.resolve(TMPDIR, 'nock-fixtures/')

let nock: { nockDone: () => void; context: NockBackContext }

beforeAll(async () => {
  await del(path.join(OUTDIR, '*'))
  nock = (await nockBack('syosetu.json'))
})

afterAll(async () => {
  return nock.nockDone()
})

describe('Series', () => {
  const href = new URL('http://ncode.syosetu.com/n0537cm/')
  const title = '邪神アベレージ'
  test('constructor', async () => {
    const outputDir = path.join(OUTDIR, 'constructor')
    const series = new Series(await getNovel(href), {
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
    const outputDir = path.join(OUTDIR, 'serialize()')
    const series = new Series(await getNovel(href), {
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
    const outputDir = path.join(OUTDIR, 'update()')
    const series = new Series(await getNovel(href), {
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
})
