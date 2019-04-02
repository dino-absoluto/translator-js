/**
 * @file index.ts
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
import { WebNovel } from '../syosetu'
import { URL } from 'url'
/* code */

describe('WebNovel', () => {
  test('constructor', async () => {
    const href = 'http://ncode.syosetu.com/n0537cm/'
    const wn = new WebNovel(new URL(href))
    expect(wn.over18).toBeFalsy()
    expect(wn.id).toBe('n0537cm')
    expect(wn.rootURL).toBe('https://ncode.syosetu.com/')
    expect(wn.infoURL).toBe('https://ncode.syosetu.com/novelview/infotop/ncode/n0537cm/')
    expect(wn.indexURL).toBe('https://ncode.syosetu.com/n0537cm/')
    expect(wn.name).toBeUndefined()
    await wn.fetch()
    expect(wn).toEqual(expect.objectContaining({
      name: '邪神アベレージ',
      author: '北瀬野ゆなき',
      genre: 'ハイファンタジー',
      status: { completed: true, size: 82 }
    }))
  })
})
