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

const sanitizeName = (name?: string) => {
  return flow(trim(name))
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
}

interface ContainerOptions {
  outputDir: string
  canRename?: boolean
  name?: string
}

export class Container implements ContainerOptions {
  readonly outputDir: string
  readonly canRename: boolean
  private _name?: string
  private _accessed = false
  constructor (options: ContainerOptions) {
    this.outputDir = path.resolve(options.outputDir)
    this.canRename = !!options.canRename
    const name = sanitizeName(options.name)
    if (name) {
      this._name = name
    } else {
      // no name
      if (!this.canRename) {
        throw new Error('No name yet can\'t be renamed')
      }
    }
  }

  private rename (oldName: string, newName: string) {
    newName = path.resolve(this.outputDir, newName)
    oldName = path.resolve(this.outputDir, oldName)
    if (oldName === newName) {
      return
    }
    try {
      fs.renameSync(oldName, newName)
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
  }

  get name () { return this._name }
  async setName (name: string) {
    if (!this.canRename && this.name != null) {
      throw new Error('Can\'t be renamed')
    }
    const newName = sanitizeName(name)
    if (!newName) {
      throw new Error('Setting invalid dirname')
    }
    const oldName = this._name
    if (oldName) {
      this.rename(oldName, newName)
    }
    this._name = newName
    this._accessed = false
  }

  get path () {
    const { name } = this
    if (!name) {
      throw new Error('rootDir is undefined')
    }
    return path.resolve(this.outputDir, name)
  }

  async access () {
    if (this._accessed) {
      return
    } else {
      await makeDir(this.path)
      this._accessed = true
    }
  }

  async clean () {
    fs.rmdirSync(this.path)
  }
}

interface FileOptions {
  readonly container: Container
  canRename?: boolean
  name?: string
}

export class File implements FileOptions {
  readonly container: Container
  readonly canRename: boolean
  private _name?: string
  private _removed = false
  constructor (options: FileOptions) {
    this.container = options.container
    this.canRename = !!options.canRename
    const name = sanitizeName(options.name)
    if (name) {
      this._name = name
    } else {
      // no name
      if (!this.canRename) {
        throw new Error('No name yet can\'t be renamed')
      }
    }
  }

  private rename (oldName: string, newName: string) {
    if (oldName === newName) {
      return
    }
    newName = path.resolve(this.dirname, newName)
    oldName = path.resolve(this.dirname, oldName)
    fs.renameSync(oldName, newName)
  }

  get name () { return this._name }
  async setName (name: string | undefined) {
    await this.access()
    const newName = sanitizeName(name)
    if (!newName) {
      throw new Error('Setting invalid dirname')
    }
    if (!this.canRename) {
      throw new Error('Can\'t be rename')
    }
    const oldName = this._name
    if (oldName) {
      this.rename(oldName, newName)
    }
    this._name = newName
  }

  get dirname () {
    return this.container.path
  }

  get path () {
    const { name } = this
    if (!name) {
      throw new Error('rootDir is undefined')
    }
    return path.resolve(this.dirname, name)
  }

  async access () {
    if (this._removed) {
      throw new Error('File has been removed')
    }
  }

  async getData () {
    await this.access()
    return fs.readFileSync(this.path)
  }

  async setData (content: string | Buffer) {
    await this.access()
    await this.container.access()
    fs.writeFileSync(this.path, content)
  }

  async remove () {
    await this.access()
    this._removed = true
    fs.unlinkSync(this.path)
  }
}
