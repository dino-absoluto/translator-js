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
import { EpisodeList } from '../episode'
import { Folder } from '../fs'
import { Chapter, ChapterData, RenderFn } from '../../providers/common'
import { hashDir, setup } from '../../../utils/test-utils'
import * as path from 'path'

/* setup */
const { __TMPDIR } = setup(__filename)

/* code */
interface FakeData extends ChapterData {
  group?: string | undefined
  name: string
  updateId?: string | undefined
  text: string
}

class FakeChapter implements Chapter {
  public group?: string | undefined
  public name: string = ''
  public updateId?: string | undefined
  public content?: RenderFn
  private text: string = ''
  public constructor (options: FakeData) {
    Object.assign(this, options)
  }
  public async fetch (): Promise<void> {
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
    const tmpPath = path.join(__TMPDIR, 'constructor')
    const rootDir = new Folder(null, tmpPath)
    const eplist = new EpisodeList(rootDir, {
    })
    await eplist.ready
  })
  test('simple tree', async () => {
    const tmpPath = path.join(__TMPDIR, 'constructor')
    const rootDir = new Folder(null, tmpPath)
    const eplist = new EpisodeList(rootDir, {
    })
    await rootDir.real()
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
