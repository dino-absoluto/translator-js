/**
 * @file Episode
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
import { EpisodeList } from '../episode'
import { Folder } from '../fs'
import { Chapter, ChapterData, RenderFn } from '../../providers/common'
import { hashDir } from '../../../utils/test-utils'
import * as path from 'path'
import del from 'del'
import makeDir = require('make-dir')
/* code */

const TMPDIR = path.resolve('__tmp__/jest-tmp/get__core-episode')
beforeAll(async () => {
  await del(path.join(TMPDIR, '*'))
  return makeDir(TMPDIR)
})

interface FakeData extends ChapterData {
  group?: string | undefined
  name: string
  updateId?: string | undefined
  text: string
}

class FakeChapter implements Chapter {
  group?: string | undefined
  name: string = ''
  updateId?: string | undefined
  content?: RenderFn
  private text: string = ''
  constructor (options: FakeData) {
    Object.assign(this, options)
  }
  async fetch () {
    this.content = (fmt) => {
      fmt.requestFile(this.name + '.txt', _fname => [
        _fname,
        this.text
      ])
    }
  }
}

describe('EpisodeList', () => {
  test('constructor.1', async () => {
    const tmpPath = path.join(TMPDIR, 'constructor')
    const rootDir = new Folder(null, tmpPath)
    const eplist = new EpisodeList(rootDir, {
    })
    await eplist.ready
  })
  test('simple tree', async () => {
    const tmpPath = path.join(TMPDIR, 'constructor')
    const rootDir = new Folder(null, tmpPath)
    const eplist = new EpisodeList(rootDir, {
    })
    await rootDir.access()
    await eplist.ready
    expect(await hashDir(path.join(tmpPath, '**/*'), {
      cwd: tmpPath
    })).toMatchSnapshot()
    await eplist.updateWith([
      new FakeChapter({
        name: 'prologue',
        text: 'Hello!!'
      }),
      new FakeChapter({
        name: 'First Chapter',
        text: 'Nothing!!'
      }),
      new FakeChapter({
        name: '2nd Chapter',
        text: 'Still nothing!!'
      }),
      new FakeChapter({
        group: 'New group',
        name: '3nd Chapter',
        text: 'Still nothing!!!'
      })
    ])
    expect(await hashDir(path.join(tmpPath, '**/*'), {
      cwd: tmpPath
    })).toMatchSnapshot()
    await eplist.updateWith([
      new FakeChapter({
        name: 'prologue',
        text: 'Hello!! Updated!'
      }),
      new FakeChapter({
        updateId: '2',
        name: 'First Chapter',
        text: 'Nothing!! 2!!'
      }),
      new FakeChapter({
        updateId: '2',
        name: '2nd Chapter',
        text: 'Still nothing!! Again!'
      }),
      new FakeChapter({
        group: 'New group',
        name: '3nd Chapter',
        text: 'Still nothing!!! And Again!'
      })
    ])
    expect(await hashDir(path.join(tmpPath, '**/*'), {
      cwd: tmpPath
    })).toMatchSnapshot()
    await eplist.updateWith([
      new FakeChapter({
        name: 'prologue',
        text: 'Hello!! Updated!'
      }),
      new FakeChapter({
        updateId: '2',
        name: 'First Chapter',
        text: 'Nothing!! 2!!'
      }),
      new FakeChapter({
        group: 'New group',
        updateId: '2',
        name: '2nd Chapter',
        text: 'Still nothing!! Again!'
      }),
      new FakeChapter({
        group: 'New group',
        name: '3nd Chapter',
        text: 'Still nothing!!! And Again!'
      })
    ])
    expect(await hashDir(path.join(tmpPath, '**/*'), {
      cwd: tmpPath
    })).toMatchSnapshot()
  })
})
