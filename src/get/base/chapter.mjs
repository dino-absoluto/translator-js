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
import Patch from './patch'
import path from 'path'
import fs from 'fs'
import filenamify from 'filenamify'
import makeDir from 'make-dir'
import chalk from 'chalk'
/* -imports */

export class FileInfo {
  constructor (options) {
    const { chapter } = options
    Object.defineProperties(this, {
      chapter: { value: chapter },
      integrity: { enumerable: true, value: options.integrity },
      fname: { enumerable: true, value: options.fname },
      buffer: { writable: true, value: options.buffer }
    })
  }

  get relative () {
    return path.join(this.chapter.dirRelative, this.fname)
  }

  get absolute () {
    return path.join(this.chapter.dirAbsolute, this.fname)
  }

  exists () {
    try {
      fs.accessSync(this.absolute)
      return true
    } catch (error) {
      return false
    }
  }

  async write (force = false) {
    if (!this.buffer) {
      return
    }
    if (typeof this.buffer === 'function') {
      this.buffer = await this.buffer()
    }
    fs.writeFileSync(this.absolute, await this.buffer, {
      flag: force ? 'w' : 'wx'
    })
  }

  remove (force = false) {
    const { relative } = this
    if (relative.length > 0 && typeof relative === 'string') {
      fs.unlinkSync(this.absolute)
    }
  }
}

export default class Chapter extends Patch {
  constructor (props) {
    super(props)
    this.props.files = props.files && props.files.map((data, index) => {
      return new FileInfo(Object.assign({}, data, {
        chapter: this
      }))
    })
    Object.defineProperties(this, {
      index: { get: () => this.props.index },
      title: { enumerable: true, get: () => this.props.title },
      files: { enumerable: true, get: () => this.props.files },
      integrity: { enumerable: true, get: () => this.props.integrity },
      volume: {
        enumerable: true,
        get: () => {
          let vol = this.props.volume && this.props.volume.index
          if (Number.isInteger(vol)) {
            return vol
          }
        }
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
    if (this.props.base) {
      return this.props.base
    }
    return process.cwd()
  }

  async shouldUpdate (last, patch) {
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
    if (patch.index && patch.index !== last.index) {
      return true
    }
    if (last.files) {
      for (const info of last.files) {
        if (!await info.exists()) {
          return true
        }
      }
      if (patch.files) {
        for (const [info, index] of last.files.entries()) {
          const pInfo = patch.files[index]
          if (info.integrity !== pInfo.integrity) {
            return true
          }
          if (info.fname !== pInfo.fname) {
            return true
          }
        }
      }
    }
    return false
  }

  async willUpdate (last, patch) {
    super.willUpdate(...arguments)
    const files = this.props.files
    makeDir.sync(this.dirAbsolute)
    if (!files) {
      return
    }
    await Promise.all(files.map(info => {
      try {
        info.remove()
      } catch (err) {
      }
    }))
  }

  updateFiles () {
    const { props } = this
    return [
      {
        fname: this.getName(`${props.title}.txt`),
        integrity: undefined
      }
    ]
  }

  async update () {
    const { props } = this
    props.files = await this.updateFiles()
  }

  async didUpdate () {
    const { props } = this
    if (!props.files) {
      return
    }
    props.files = props.files.map(info => new FileInfo(Object.assign({}, info, {
      chapter: this
    }, info)))
    const { files } = props
    makeDir.sync(this.dirAbsolute)
    let promises = Promise.all(files.map(info => {
      if (info.buffer) {
        return info.write(props.overwrite)
      }
    }))
    return promises
  }

  printInfo () {
    const { props } = this
    const { files } = props
    console.log(chalk`  {gray ${this.prefix}} ${props.title}{green ${
      files.length > 1 ? (' +' + (files.length - 1)) : ''
    }}`)
  }
}
