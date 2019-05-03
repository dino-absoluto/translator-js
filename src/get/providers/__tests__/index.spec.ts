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
import { getProvider } from '..'
import Syosetu from '../syosetu'

/* code */
describe('module providers', () => {
  test('getProvider()', async () => {
    expect(await getProvider(new URL('http://ncode.syosetu.com/n0537cm/')))
      .toBe(Syosetu)
    expect(await getProvider(new URL('https://ncode.syosetu.com/n0537cm/')))
      .toBe(Syosetu)
    expect(await getProvider(new URL('https://novel18.syosetu.com/')))
      .toBe(Syosetu)
    expect(await getProvider(new URL('https://NOVEL18.SYOSETU.COM/')))
      .toBe(Syosetu)
    expect(getProvider(new URL('https://example.com/')))
      .rejects.toThrow()
  })
})
