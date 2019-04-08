/**
 * @author Dino <dinoabsoluto+dev@gmail.com>
 * @license
 * Translator-js - Scripts to facilitate Japanese webnovel
 * Copyright (C) 2019 Dino <dinoabsoluto+dev@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */
/* imports */
import { Novel, NovelData } from '../providers/common'
import { getNovel } from '../providers'
import { Folder, File } from './fs'
import { EpisodeList, ProgressFn } from './episode'
import * as path from 'path'
/* code */

type SeriesProgressFn = (series: Series, c: number, total: number) => void

export interface SeriesOptions {
  outputDir: string
  sourceURL?: string
  basename?: string
  data?: NovelData
  overwrite?: boolean
  novel?: Novel
}

export class Series {
  private novel?: Novel
  private episodes?: EpisodeList
  readonly data: NovelData
  readonly container: Folder
  readonly metaFile: File
  readonly ready: Promise<void>
  readonly overwrite: boolean
  constructor (options: SeriesOptions) {
    const data = Object.assign({}, options.novel, options.data)
    this.data = data
    this.novel = options.novel
    this.overwrite = !!options.overwrite
    let container: Folder
    const name = options.basename || this.data.name
    data.name = name
    if (options.basename) {
      container = new Folder(null,
        path.join(options.outputDir,options.basename))
    } else {
      const rootDir = new Folder(null, options.outputDir)
      container = rootDir.requestFolder(name || '')
    }
    const metaFile = container.requestFile('index.json')
    this.container = container
    this.metaFile = metaFile
    this.ready = (async () => {
      if (!this.novel && options.sourceURL) {
        await this.loadURL(options.sourceURL)
      }
      if (name) {
        await this.load()
      }
    })()
  }

  private async loadURL (sourceURL: string) {
    try {
      const url = new URL(sourceURL)
      this.novel = await getNovel(url)
    } catch {
      throw new Error('failed to get novel')
    }
  }

  private async verify (data: any): Promise<NovelData | undefined> {
    if (!data || typeof data !== 'object') {
      return
    }
    if (data.sourceURL) {
      if (!this.overwrite) {
        throw new Error('unsupported older version, use overwrite to refresh')
      } else if (!this.novel) {
        try {
          const url = new URL(data.sourceURL)
          this.novel = await getNovel(url)
        } catch {
          throw new Error('failed to get novel')
        }
      }
    }
    if (data.id) {
      return data
    }
  }

  async load () {
    const { metaFile, data, data: { name } } = this
    if (!name) {
      return
    }
    try {
      const buffer = await metaFile.read()
      const json = JSON.parse(buffer.toString())
      Object.assign(data, await this.verify(json))
      if (!this.novel && data.url) {
        await this.loadURL(data.url)
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
  }

  hasMeta (): boolean {
    const { data } = this
    return !!(data.name &&
      data.author &&
      data.description &&
      data.genre &&
      data.keywords &&
      data.status)
  }

  async update () {
    const { novel, data } = this
    if (!novel) {
      throw new Error('novel is undefined')
    }
    if (!this.hasMeta()) {
      await novel.fetch()
    }
    Object.assign(data, novel)
    const name = data.name
    if (name && this.container.renameable) {
      await this.container.rename(name)
    }
    await this.metaFile.write(JSON.stringify(data, null, 1))
  }

  async updateIndex (options: {
    onProgress?: SeriesProgressFn,
    checkFs?: boolean
  } = {}) {
    const { onProgress, checkFs = false } = options
    let progress: ProgressFn | undefined
    if (onProgress) {
      progress = onProgress.bind(undefined, this)
    }
    await this.update()
    if (!this.episodes) {
      this.episodes = new EpisodeList(this.container)
    }
    const { novel, episodes } = this
    if (!novel) {
      throw new Error('novel is undefined')
    }
    await episodes.ready
    const index = await novel.fetchIndex()
    return episodes.updateWith(index, {
      progress,
      checkFs
    })
  }
}
