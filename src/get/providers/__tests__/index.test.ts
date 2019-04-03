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
import { getProvider } from '..'
import Syosetu from '../syosetu'
/* code */

describe('module providers', () => {
  test('getProvider()', async () => {
    expect(await getProvider(new URL('http://ncode.syosetu.com/n0537cm/')))
      .toBe(Syosetu)
    expect(await getProvider(new URL('https://ncode.syosetu.com/n0537cm/')))
      .toBe(Syosetu)
    expect(await getProvider(new URL('https://over18.syosetu.com/')))
      .toBe(Syosetu)
    expect(await getProvider(new URL('https://OVER18.SYOSETU.COM/')))
      .toBe(Syosetu)
    expect(getProvider(new URL('https://example.com/')))
      .rejects.toThrow()
  })
})
