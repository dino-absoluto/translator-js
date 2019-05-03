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
import { setup } from '../../../utils/test-utils'
// import * as pfs from '../../../utils/pfs'
import { KakuyomuNovel, KakuyomuChapter } from '../kakuyomu'
import { RenderFn } from '../common'
import { SimpleContext } from '../context'
// import * as path from 'path'

/* setup */
// const { __TMPDIR } =
setup(__filename, {
  network: true
})

/* code */
describe('KakuyomuNovel', () => {
  const testURL = 'https://kakuyomu.jp/works/1177354054880848824'
  test('constructor', async () => {
    const wn = new KakuyomuNovel(new URL(testURL))
    expect(wn.id).toBe('1177354054880848824')
    expect(wn.rootURL).toBe('https://kakuyomu.jp/works/')
    expect(wn.indexURL).toBe('https://kakuyomu.jp/works/1177354054880848824')
    expect(wn.name).toBeUndefined()
  })
  test('fetch()', async () => {
    const wn = new KakuyomuNovel(new URL(testURL))
    await wn.fetch()
    expect(wn).toEqual(expect.objectContaining({
      name: '何回ガチャを引いてもレアが出ないから腹いせに書いたファンタジー',
      author: '槻影',
      genre: '異世界ファンタジー',
      status: { completed: true, size: 9 },
      keywords: [
        '闇ガチャ',
        'ファンタジー',
        'ライトノベル',
        'コメディ',
        '完結済み',
        'ラノゲID-925'
      ]
    }))
  })
  test('fetchIndex()', async () => {
    const wn = new KakuyomuNovel(new URL(testURL))
    let indexes = await wn.fetchIndex()
    expect(indexes.length).toBe(9)
    expect(indexes[0]).toEqual({
      url: new URL('https://kakuyomu.jp/works/1177354054880848824/episodes/1177354054880848827'),
      group: undefined,
      name: '何回引いてもレアが出ない',
      updateId: '2016-04-11T04:50:21Z'
    })
    expect(indexes[8]).toEqual({
      url: new URL('https://kakuyomu.jp/works/1177354054880848824/episodes/1177354054882769185'),
      group: '後日談',
      name: '僕のお父さん',
      updateId: '2017-03-13T18:05:27Z'
    })
  })
})

describe('KakuyomuChapter', () => {
  const href = 'https://kakuyomu.jp/works/1177354054880848824/episodes/1177354054880848827'
  test('fetch()', async () => {
    const chapter = new KakuyomuChapter({
      name: '',
      url: new URL(href)
    })
    expect(chapter.name).toBe('')
    await chapter.fetch()
    expect(chapter.name).toBe('何回引いてもレアが出ない')
    const content = chapter.content
    expect(content).not.toBeNull()
    let lines: string[] = []
    const ctx = new SimpleContext()
    ;(content as RenderFn)(ctx)
    lines = ctx.text[0][1]
    expect(lines.length).toBe(2)
    const data = lines.join('\n\n---\n\n')
    expect(data.length).toBeGreaterThan(3000)
    expect(data).toContain('　僕はただ、その仕草を見ていた。')
    expect(data).toContain('§§§')
  })
})
