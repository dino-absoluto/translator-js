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
import * as pfs from '../../../utils/pfs'
import { SyosetuNovel, SyosetuChapter } from '../syosetu'
import { RenderFn } from '../common'
import { SimpleContext } from '../context'
import * as path from 'path'

/* setup */
const { __TMPDIR } = setup(__filename, {
  network: true
})

/* code */
describe('SyosetuNovel', () => {
  const href = 'http://ncode.syosetu.com/n0537cm/'
  test('constructor', async () => {
    const wn = new SyosetuNovel(new URL(href))
    expect(wn.over18).toBeFalsy()
    expect(wn.id).toBe('n0537cm')
    expect(wn.rootURL).toBe('https://ncode.syosetu.com/')
    expect(wn.infoURL).toBe('https://ncode.syosetu.com/novelview/infotop/ncode/n0537cm/')
    expect(wn.indexURL).toBe('https://ncode.syosetu.com/n0537cm/')
    expect(wn.name).toBeUndefined()
  })
  test('fetch()', async () => {
    const wn = new SyosetuNovel(new URL(href))
    await wn.fetch()
    expect(wn).toEqual(expect.objectContaining({
      name: '邪神アベレージ',
      author: '北瀬野ゆなき',
      genre: 'ハイファンタジー',
      status: { completed: true, size: 82 }
    }))
  })
  test('fetchIndex()', async () => {
    const wn = new SyosetuNovel(new URL(href))
    let indexes = await wn.fetchIndex()
    expect(indexes.length).toBe(82)
    expect(indexes[0]).toEqual({
      url: new URL('https://ncode.syosetu.com/n0537cm/1/'),
      group: '【前篇～邪之章～】',
      name: '01：些細な願い',
      updateId: '2015/02/17 21:30 改稿'
    })
    expect(indexes[40]).toEqual({
      url: new URL('https://ncode.syosetu.com/n0537cm/41/'),
      group: '【後篇～神之章～】',
      name: '09：彼らが帰ってきた',
      updateId: '2015/03/26 23:00'
    })
  })
})

describe('SyosetuChapter', () => {
  const href = 'https://ncode.syosetu.com/n0537cm/63/'
  test('fetch()', async () => {
    const chapter = new SyosetuChapter({
      name: '',
      url: new URL(href)
    })
    expect(chapter.name).toBe('')
    await chapter.fetch()
    expect(chapter.name).toBe('記念SS：異伝「クリスマス禁止令」')
    const content = chapter.content
    expect(content).not.toBeNull()
    let lines: string[] = []
    const ctx = new SimpleContext()
    ;(content as RenderFn)(ctx)
    lines = ctx.text[0][1]
    expect(lines.length).toBe(4)
    const data = lines.join('\n\n---\n\n')
    expect(data.length).toBeGreaterThan(3000)
    expect(data).toContain('　違うらしい。')
    expect(data).toContain('　──よし、決めた。')
  })
  test('fetch() with image', async () => {
    const href = 'https://ncode.syosetu.com/n4147dw/353/'
    const chapter = new SyosetuChapter({
      name: '',
      url: new URL(href)
    })
    expect(chapter.name).toBe('')
    await chapter.fetch()
    expect(chapter.name).toBe('はこにわもぐもぐ　さーしーえー')
    const content = chapter.content
    expect(content).not.toBeNull()
    const ctx = new SimpleContext()
    ;(content as RenderFn)(ctx)
    {
      const fpath = path.join(__TMPDIR, ctx.text[0][0])
      const lines = ctx.text[0][1]
      expect(lines.length).toBe(2)
      const data = lines.join('\n\n---\n\n')
      expect(data.length).toBeGreaterThan(4000)
      await pfs.writeFile(fpath, data)
    }
    for (const [name, buf] of ctx.bufs) {
      const fpath = path.join(__TMPDIR, name)
      await pfs.writeFile(fpath, buf)
    }
  })
})
