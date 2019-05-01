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
import { flow } from '../../utils/flow'
import { Chapter } from '../providers/common'
import { Context as AbstractContext } from '../providers/context'
import { Folder, File } from './fs'
import { gunzipSync, gzipSync } from 'zlib'
import pLimit from 'p-limit'
import throttle = require('lodash/throttle')
/* code */

export type ProgressFn = (done: number, total: number) => void
export interface UpdateOptions {
  progress?: ProgressFn
  checkFs?: boolean
}

export interface UpdateItem {
  index: number
  chapter: Chapter
}
export interface UpdateReport {
  updates: UpdateItem[]
  news: UpdateItem[]
}

class Context extends AbstractContext {
  readonly files = new Map<string, string[] | Buffer>()
  readonly prefix: string
  constructor (prefix: string) {
    super()
    this.prefix = prefix
  }

  requestFile (name: string, get: (name: string) => string[] | Buffer) {
    const { files, prefix } = this
    flow(this.resolveName(`${prefix}${name}`.trim()))
      .then(name => {
        if (files.has(name)) {
          return
        }
        files.set(name, get(name))
      })
  }
}

interface EpisodeData {
  groupId?: number
  updateId?: string
  files?: string[]
}

interface EpisodeListData {
  groups: string[]
  episodes: EpisodeData[]
}

export class EpisodeList {
  readonly rootDir: Folder
  data: EpisodeListData
  ready: Promise<void>
  private folders: Folder[]
  private metaFile: File
  private compressedCache: boolean
  private pad0: number = 3
  private saveThrottle = throttle(this.save.bind(this), 3000)
  constructor (rootDir: Folder, options: {
    compressedCache?: boolean
    pad0?: number
    data?: EpisodeListData
  } = {}) {
    this.rootDir = rootDir
    this.data = options.data || {
      groups: [],
      episodes: []
    }
    this.compressedCache = !!options.compressedCache
    this.pad0 = options.pad0 || this.pad0
    const metaDir = rootDir.requestFolder('!meta')
    const metaFile = metaDir.requestFile(
      this.compressedCache ? '!cache.json.gz' : '!cache.json')
    const folders = [
      rootDir.requestFolder('0'.padStart(this.pad0, '0'))
    ]
    this.folders = folders
    this.metaFile = metaFile
    this.ready = this.load()
  }

  async updateWith (newData: Chapter[], options: UpdateOptions = {}) {
    const { data: { episodes } } = this
    const { groups, chapters } = this.preprocess(newData)
    const { progress } = options
    const report: UpdateReport = {
      updates: [],
      news: []
    }
    const limit = pLimit(2)
    const oldLength = episodes.length
    await this.updateGroups(groups)
    const tasks: UpdateItem[] = []
    for (const [index, chapter] of chapters.entries()) {
      if (await this.pingEpisode(index, chapter, options)) {
        const item: UpdateItem = {
          index, chapter
        }
        tasks.push(item)
        if (index < oldLength) {
          report.updates.push(item)
        } else {
          report.news.push(item)
        }
      }
    }
    let count = 0
    const length = tasks.length
    if (progress) {
      progress(0, length)
    }
    await Promise.all(tasks.map(({ index, chapter }) => {
      return limit(async () => {
        await this.updateEpisode(index, chapter, options)
        await this.saveThrottle()
        if (progress) {
          progress(++count, length)
        }
      })
    }))
    episodes.length = chapters.length
    await this.saveThrottle.flush()
    return report
  }

  private encode (data: object) {
    if (!this.compressedCache) {
      return JSON.stringify(data, null, 1)
    } else {
      return gzipSync(JSON.stringify(data))
    }
  }
  private decode (data: Buffer) {
    if (!this.compressedCache) {
      return JSON.parse(data.toString())
    } else {
      return JSON.parse(gunzipSync(data).toString())
    }
  }

  private async updateGroups (groups: string[]) {
    const { folders, rootDir, data } = this
    for (const [index, group] of groups.entries()) {
      const id = index + 1
      let folder = folders[id]
      if (!folder) {
        folder = rootDir.requestFolder(group)
        folders[id] = folder
      } else {
        if (group !== folder.name) {
          await folder.rename(group)
        }
      }
    }
    data.groups = groups
  }

  private async isEpisodeUptodate (
    ep: EpisodeData,
    ch: Chapter & EpisodeData,
    options: UpdateOptions
  ): Promise<boolean> {
    if (!ep.files || !ep.files.length) {
      return false
    }
    if (ch.updateId && ep.updateId !== ch.updateId) {
      return false
    }
    if (ch.groupId && ep.groupId !== ch.groupId) {
      return false
    }
    const folder = this.folders[ep.groupId || 0]
    if (!folder) {
      throw new Error(`Folder must not be ${folder}`)
    }
    if (!options.checkFs) {
      return true
    }
    try {
      for (const fpath of ep.files) {
        const file = folder.requestFile(fpath)
        await file.access()
        await file.close()
      }
      return true
    } catch {
      return false
    }
  }

  private async pingEpisode (
    index: number,
    ch: Chapter & EpisodeData,
    options: UpdateOptions
  ) {
    const { data: { episodes } } = this
    let ep = episodes[index]
    if (!ep) {
      ep = {}
      episodes[index] = ep
    }
    if (await this.isEpisodeUptodate(ep, ch, options)) {
      return false
    }
    return ep
  }

  private async updateEpisode (
    index: number,
    ch: Chapter & EpisodeData,
    options: UpdateOptions
  ) {
    const ep = await this.pingEpisode(index, ch, options)
    if (!ep) {
      return
    }
    if (ep.files) {
      const folder = this.folders[ep.groupId || 0]
      // remove old files
      await Promise.all(ep.files.map(file => folder.requestFile(file).remove()))
      delete ep.files
    }
    await ch.fetch()
    ep.groupId = ch.groupId
    ep.updateId = ch.updateId
    const folder = this.folders[ep.groupId || 0]
    if (!folder) {
      throw new Error(`Folder must not be ${folder}`)
    }
    const context = new Context(
      `${(index + 1).toString().padStart(this.pad0, '0')} `)
    if (ch.content) {
      ch.content(context)
      delete ch.content
    }
    // write files
    const files = []
    for (const [name, data] of context.files) {
      let buf: Buffer
      if (data instanceof Buffer) {
        buf = data
      } else {
        buf = flow(data.join('\n\n---\n\n'))
          .then(text => {
            if (text[text.length - 1] !== '\n') {
              return text + '\n'
            } else {
              return text
            }
          }).then(Buffer.from).value
      }
      files.push(name)
      const file = folder.requestFile(name)
      await file.write(buf)
      await file.close()
    }
    if (files.length) {
      ep.files = files
    }
  }

  private preprocess (chapters: Chapter[]) {
    let groupId = 0
    let groupName: string | undefined
    const groups = []
    let count = 1
    for (const chapter of chapters) {
      const ch: Chapter & EpisodeData = chapter
      ++count
      if (ch.group !== groupName || count > 50) {
        count = 1
        groupId = groups.length + 1
        groups.push(`${
          groupId.toString().padStart(this.pad0, '0')} ${
          ch.group || ''}`.trim())
        groupName = ch.group
      }
      ch.groupId = groupId
    }
    return {
      groups,
      chapters
    }
  }

  private async load () {
    const { metaFile } = this
    try {
      const cache = await this.decode(await metaFile.read())
      const { data } = this
      await this.updateGroups(cache.groups)
      data.episodes = cache.episodes || []
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
  }

  async save () {
    const { metaFile } = this
    await metaFile.write(await this.encode(this.data))
  }
}
