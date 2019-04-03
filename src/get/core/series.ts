/**
 * @file Series
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
import { Novel, NovelData } from '../providers/common'
import { Container } from './fs'
/* code */

interface SeriesOptions {
  outputDir: string
  basename?: string
  data?: NovelData
}

export class Series {
  private readonly novel: Novel
  readonly data: NovelData
  readonly container: Container
  constructor (novel: Novel, options: SeriesOptions) {
    this.data = Object.assign({}, novel, options.data)
    this.novel = novel
    this.container = new Container({
      outputDir: options.outputDir,
      canRename: !options.basename,
      name: options.basename || this.data.name || undefined
    })
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
    if (!this.hasMeta()) {
      await novel.fetch()
    }
    Object.assign(data, novel)
    return
  }
}
