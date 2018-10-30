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
/* -imports */

export const toGetter = (value, willCache = false) => {
  if (typeof wrap === 'function') {
    if (!willCache) {
      return value
    } else {
      let cache
      return () => {
        if (!cache) {
          cache = value()
        }
        return cache
      }
    }
  } else {
    return () => value
  }
}

export default class File extends Patch {
  constructor (props) {
    super(props)
    Object.defineProperties(this, {
      targetDir: { get: toGetter(this.props.targetDir) },
      integrity: { enumerable: true, get: () => this.props.integrity },
      fname: { enumerable: true, get: () => this.props.fname },
      buffer: { writable: true, value: toGetter(() => this.props.buffer, true) }
    })
  }

  get absolute () {
    return path.join(this.targetDir, this.fname)
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
    fs.writeFileSync(this.absolute, await this.buffer(), {
      flag: force ? 'w' : 'wx'
    })
  }

  remove (force = false) {
    const { fname } = this
    if (typeof fname === 'string' && fname.length > 0) {
      fs.unlinkSync(this.absolute)
    }
  }
}
