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
import { Novel, NovelData } from '../providers/common'
import { getNovel } from '../providers'
import { Folder, File } from './fs'
import { EpisodeList, ProgressFn, UpdateReport } from './episode'
import * as path from 'path'
/* code */

type SeriesProgressFn = (series: Series, c: number, total: number) => void

interface OldData {
  sourceURL: string
}

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
  public readonly data: NovelData
  public readonly container: Folder
  public readonly metaFile: File
  public readonly ready: Promise<void>
  public readonly overwrite: boolean
  public constructor (options: SeriesOptions) {
    const data = Object.assign({}, options.novel, options.data)
    this.data = data
    this.novel = options.novel
    this.overwrite = !!options.overwrite
    let container: Folder
    const name = options.basename || this.data.name
    data.name = name
    if (options.basename) {
      container = new Folder(null,
        path.join(options.outputDir, options.basename))
    } else {
      const rootDir = new Folder(null, options.outputDir)
      container = rootDir.requestFolder(name || '')
    }
    const metaFile = container.requestFile('index.json')
    this.container = container
    this.metaFile = metaFile
    this.ready = (async (): Promise<void> => {
      if (!this.novel && options.sourceURL) {
        await this.loadURL(options.sourceURL)
      }
      if (name) {
        await this.load()
      }
    })()
  }

  private async loadURL (sourceURL: string): Promise<void> {
    try {
      const url = new URL(sourceURL)
      this.novel = await getNovel(url)
    } catch {
      throw new Error('failed to get novel')
    }
  }

  private async verify (data: Partial<NovelData & OldData> | undefined): Promise<NovelData | undefined> {
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
    if (typeof data.id === 'string') {
      return data as NovelData
    }
  }

  public async load (): Promise<void> {
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

  public hasMeta (): boolean {
    const { data } = this
    return !!(data.name &&
      data.author &&
      data.description &&
      data.genre &&
      data.keywords &&
      data.status)
  }

  public async update (): Promise<void> {
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

  public async updateIndex (options: {
    onProgress?: SeriesProgressFn
    checkFs?: boolean
  } = {}): Promise<UpdateReport> {
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
