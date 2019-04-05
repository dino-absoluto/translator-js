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
import { flow } from '../../utils/flow'
import { Chapter } from '../providers/common'
import { Context as AbstractContext } from '../providers/context'
import { Folder, File } from './fs'
import { gunzipSync, gzipSync } from 'zlib'
/* code */

class Context extends AbstractContext {
  readonly files = new Map<string, string[] | Buffer>()
  readonly prefix: string
  constructor (prefix: string) {
    super()
    this.prefix = prefix
  }

  requestFile (name: string, get: (name: string) => string[] | Buffer) {
    const { files, prefix } = this
    name = `${prefix}${name}`.trim()
    if (files.has(name)) {
      return
    }
    files.set(name, get(name))
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

  async updateWith (newData: Chapter[]) {
    const { data: { episodes } } = this
    const { groups, chapters } = this.preprocess(newData)
    await this.updateGroups(groups)
    for (const [index, chapter] of chapters.entries()) {
      await this.updateEpisode(index, chapter)
    }
    episodes.length = chapters.length
    return this.save()
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

  private testEpisode (ep: EpisodeData, ch: Chapter & EpisodeData): boolean {
    if (!ep.files || !ep.files.length) {
      return false
    }
    if (ch.updateId && ep.updateId !== ch.updateId) {
      return false
    }
    if (ch.groupId && ep.groupId !== ch.groupId) {
      return false
    }
    return true
  }

  private async updateEpisode (index: number, ch: Chapter & EpisodeData) {
    const { data: { episodes } } = this
    let ep = episodes[index]
    if (!ep) {
      ep = {}
      episodes[index] = ep
    }
    if (this.testEpisode(ep, ch)) {
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
          }).then(Buffer.from).get()
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
    for (const chapter of chapters) {
      const ch: Chapter & EpisodeData = chapter
      if (ch.group !== groupName) {
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
