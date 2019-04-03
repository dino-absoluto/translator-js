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
import { Novel, NovelData } from '../providers'
/* code */

export interface SeriesData {
  readonly novel?: NovelData
}

export class Series implements SeriesData {
  readonly novel: Novel
  constructor (novel: Novel, data?: NovelData) {
    if (data) {
      if (data.id !== novel.id) {
        throw new Error('Novel and data don\'t match')
      }
      Object.assign(novel, data)
    }
    this.novel = novel
  }

  serialize () {
    return JSON.stringify(this.novel, null, 1)
  }
}
