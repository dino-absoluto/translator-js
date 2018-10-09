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
import Base from './base'
import path from 'path'
import filenamify from 'filenamify'
/* -imports */

export class FileInfo {
  constructor (options) {
    this.title = options.title
    this.integrity = options.integrity
    Object.defineProperties(this, {
      chapter: { value: options.chapter }
    })
  }

  get absolute () {
    return path.join(this.chapter.dirname, this.filename)
  }

  exists () {
  }
}

export default class Chapter extends Base {
  get base () {
    const { props } = this
    if (props.base) {
      return path.resolve(props.base)
    }
    if (props.volume) {
      return props.volume.base
    }
    return process.cwd()
  }

  get filename () {
    const { props } = this
    let name = filenamify(`${
      props.index.toString().padStart(3, '0')
    } ${props.title}.txt`)
    return name
  }

  get relative () {
    const { props } = this
    let relative = this.filename
    if (props.volume) {
      return path.join(props.volume.relative, relative)
    }
    return relative
  }

  get absolute () {
    return path.resolve(this.base, this.relative)
  }

  get dirname () {
    const { props } = this
    if (props.volume) {
      return props.volume.absolute
    } else {
      return this.base
    }
  }

  shouldUpdate (last, patch) {
    if (patch.integrity && patch.integrity !== last.integrity) {
      return true
    }
    return false
  }
}
