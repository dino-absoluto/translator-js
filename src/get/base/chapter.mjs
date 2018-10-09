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
import fs from 'fs'
import filenamify from 'filenamify'
/* -imports */

export class FileInfo {
  constructor (options) {
    const { chapter } = options
    Object.defineProperties(this, {
      chapter: { value: chapter },
      integrity: { enumerable: true, value: options.integrity },
      fname: { enumerable: true, value: options.fname }
    })
  }

  get relative () {
    return path.join(this.chapter.dirRelative, this.fname)
  }

  get absolute () {
    return path.join(this.chapter.dirAbsolute, this.fname)
  }

  exists () {
    return fs.accessSync(this.absolute)
  }

  write (buffer, overwrite = false) {
    fs.writeFileSync(this.absolute, buffer, {
      flag: overwrite ? 'w' : 'wx'
    })
  }
}

export default class Chapter extends Base {
  constructor (props) {
    super(props)
    Object.defineProperties(this, {
      title: { enumerable: true, get: () => this.props.title },
      index: { enumerable: true, get: () => this.props.index },
      files: { enumerable: true, get: () => this.props.files },
      volume: {
        enumerable: true,
        get: () => (this.props.volume && this.props.volume.index) || undefined
      }
    })
  }

  getName (fname) {
    return filenamify(`${this.prefix} ${fname}`)
  }

  get prefix () {
    return `${
      this.props.index.toString().padStart(3, '0')
    }`
  }

  get dirRelative () {
    const { volume } = this.props
    if (volume) {
      return volume.relative
    }
    return ''
  }

  get dirAbsolute () {
    const { volume } = this.props
    if (volume) {
      return volume.absolute
    }
    return process.cwd()
  }

  shouldUpdate (last, patch) {
    {
      /* ignore files */
      let names = Object.getOwnPropertyNames(patch)
      if (names.length === 1 && names[0] === 'files') {
        return false
      }
    }
    if (patch.integrity && patch.integrity !== last.integrity) {
      return true
    }
    return false
  }

  update () {
    const { props } = this
    const files = [
      new FileInfo({
        chapter: this,
        fname: this.getName(`${props.title}.txt`),
        integrity: props.integrity
      })
    ]
    this.setProps({ files })
    return files
  }
}
