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
/* code */

describe('Series', () => {
  test('constructor', async () => {
    const href = new URL('http://ncode.syosetu.com/n0537cm/')
    const novel = await getNovel(href)
    const series = new Series(novel, {
      id: 'n0537cm',
      name: '邪神アベレージ'
    })
    expect(series.novel.name).toBe('邪神アベレージ')
  })
  test('serialize()', async () => {
    const href = new URL('http://ncode.syosetu.com/n0537cm/')
    const novel = await getNovel(href)
    const series = new Series(novel)
    const text = series.serialize()
    expect(text).toContain('"id": "n0537cm"')
    expect(text).toContain('"over18": false')
  })
})
