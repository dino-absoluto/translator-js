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
import * as path from 'path'
/* code */

nockBack.setMode('record')
nockBack.fixtures = path.resolve(__dirname, '__tmp__/nock-fixtures/')

let nock: { nockDone: () => void; context: NockBackContext }

beforeAll(async () => {
  nock = (await nockBack('syosetu.json'))
})

afterAll(async () => {
  return nock.nockDone()
})

describe('Series', () => {
  const href = new URL('http://ncode.syosetu.com/n0537cm/')
  test('constructor', async () => {
    const series = new Series(await getNovel(href), {
      id: 'n0537cm',
      name: '邪神アベレージ'
    })
    expect(series.novel.name).toBe('邪神アベレージ')
  })
  test('serialize()', async () => {
    const series = new Series(await getNovel(href))
    const text = series.serialize()
    expect(text).toContain('"id": "n0537cm"')
    expect(text).toContain('"over18": false')
  })
  test('update()', async () => {
    const series = new Series(await getNovel(href))
    await series.update()
    expect(series.novel).toEqual(expect.objectContaining({
      name: '邪神アベレージ',
      author: '北瀬野ゆなき',
      genre: 'ハイファンタジー',
      status: { completed: true, size: 82 }
    }))
  })
})
