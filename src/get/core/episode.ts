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
import { Chapter } from '../providers/common'
import { Folder, File } from './fs'
/* code */

interface EpisodeData {
  groupId?: number
  updateId?: string
  files: string[]
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
  constructor (rootDir: Folder, data: EpisodeListData) {
    this.rootDir = rootDir
    this.data = data
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
      let fd = folders[id]
      if (!fd) {
        fd = rootDir.requestFolder(group)
        folders[id] = fd
      } else {
        if (group !== fd.name) {
          await fd.rename(group)
        }
      }
    }
    data.groups = groups
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
