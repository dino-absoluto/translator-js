/**
 * @file Get module
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
import * as base from './base'
/* -imports */

export class Chapter extends base.Chapter {
  update () {
    const { props } = this
    const files = [
      new base.FileInfo({
        chapter: this,
        fname: this.getName(`${props.title}.txt`),
        integrity: undefined,
        buffer: `${props.title}\n---\n\nHello World!`
      })
    ]
    this.setProps({ files })
  }
}

export class Volume extends base.Volume {
}

export class Series extends base.Series {
  get Chapter () {
    return Chapter
  }

  get Volume () {
    return Volume
  }

  refresh () {
    const volumes = [
      {
        title: 'The Beginning'
      },
      {
        title: 'The Happening'
      }
    ]
    const chapters = [
      {
        title: 'Prologue',
        integrity: 'prologue',
        volume: 0
      },
      {
        title: 'Reborn',
        integrity: 'reborn',
        volume: 1
      }
    ]
    this.updateData({
      volumes,
      chapters
    })
  }
}
