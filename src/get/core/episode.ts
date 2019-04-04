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
import { Chapter, Formatter as AbstractFormatter } from '../providers/common'
import { Folder, File } from './fs'
/* code */

class Formatter extends AbstractFormatter {
  private files = new Map()
  private prefix: string
  constructor (prefix: string) {
    super()
    this.prefix = prefix
  }

  requestFile (name: string) {
    const { files, prefix } = this
    if (files.has(name)) {
      return ''
    }
    return `${prefix}${name}`
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
  private data: EpisodeListData
  private folders: Folder[]
  private metaFile: File
  constructor (rootDir: Folder, options: {
    data?: EpisodeListData
  }) {
    this.rootDir = rootDir
    this.data = options.data || {
      groups: [],
      episodes: []
    }
    const metaDir = rootDir.requestFolder('!meta')
    const metaFile = metaDir.requestFile('!cache.json')
    const folders = [
      metaDir
    ]
    this.folders = folders
    this.metaFile = metaFile
    this.load()
  }

  updateWith (_newData: Chapter[]) {
    return
  }

  private encode (data: object) {
    return JSON.stringify(data, null, 1)
  }
  private decode (data: Buffer) {
    return JSON.parse(data.toString())
  }

  private async updateGroups (groups: string[]) {
    const { folders, rootDir, data } = this
    for (const [id, group] of groups.entries()) {
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
    if (ep.updateId && ep.updateId !== ch.updateId) {
      return false
    }
    if (ep.groupId && ep.groupId !== ch.groupId) {
      return false
    }
    return true
  }

  private async updateEpisode (index: number, ep: EpisodeData, ch: Chapter & EpisodeData) {
    if (this.testEpisode(ep, ch)) {
      return
    }
    const folder = this.folders[ep.groupId || 0]
    await ch.fetch()
    if (!folder) {
      throw new Error(`Folder must not be ${folder}`)
    }
    const format = new Formatter(`${index} `)
    // write files
    if (ep.files) {
      // remove old files
      await Promise.all(ep.files.map(file => folder.requestFile(file).remove()))
    }
  }

  private preprocess (chapters: Chapter[]) {
    let groupId = 0
    let groupName: string | undefined
    const groups = []
    for (const chapter of chapters) {
      const ch: Chapter & EpisodeData = chapter
      if (ch.group !== groupName) {
        groups.push(ch.group)
        groupId = groups.length
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
      const cache = await this.decode(await metaFile.getData())
      const { data } = this
      this.updateGroups(cache.groups)
      data.episodes = cache.episodes
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
  }

  async save () {
    const { metaFile } = this
    metaFile.setData(await this.encode(this.data))
  }
}
