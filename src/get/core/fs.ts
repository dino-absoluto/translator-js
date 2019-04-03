/**
 * @file Files management
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
import { trim, flow } from '../../utils/flow'
import * as path from 'path'
import * as fs from 'fs'
import makeDir = require('make-dir')
/* code */
interface ContainerOptions {
  outputDir: string
  canRename?: boolean
  name?: string
}

export class Container implements ContainerOptions {
  readonly outputDir: string
  canRename: boolean
  private _name?: string
  constructor (options: ContainerOptions) {
    this.outputDir = path.resolve(options.outputDir)
    this.canRename = !!options.canRename
    try {
      this.name = options.name
      // has name
    } catch {
      // no name
      if (!this.canRename) {
        throw new Error('No name yet cann\'t be renamed')
      }
    }
  }

  private rename (oldName: string | undefined, newName: string) {
    newName = path.resolve(this.outputDir, newName)
    if (!oldName) {
      makeDir.sync(newName)
      return
    }
    oldName = path.resolve(this.outputDir, oldName)
    return fs.renameSync(oldName, newName)
  }

  get name () {
    return this._name
  }

  set name (name) {
    if (!this.canRename && this.name != null) {
      throw new Error('Can\'t be rename')
    }
    const newName = flow(trim(name))
      .then(path.normalize)
      .then(name => {
        if (path.basename(name) !== name) {
          return
        }
        if (name.startsWith('..')) {
          return
        }
        return name
      }).get()
    if (newName) {
      const oldName = this._name
      this.rename(oldName, newName)
      this._name = newName
    } else {
      throw new Error('Setting invalid dirname')
    }
  }

  get rootDir () {
    const { name } = this
    if (!name) {
      throw new Error('rootDir is undefined')
    }
    return path.resolve(this.outputDir, name)
  }
}
