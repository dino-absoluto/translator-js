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
import * as pfs from '../../utils/pfs'
import * as path from 'path'
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

interface FSItem {
  parent?: Folder
  path: string
  access (): Promise<void>
  remove (): Promise<void>
  close (): Promise<void>
  rename (name: string): Promise<void>
}

export class Folder implements FSItem {
  readonly children: Set<Folder | File> = new Set()
  readonly parent?: Folder
  /* private data */
  private _dirname?: string
  private _accessed = false

  constructor (parent: Folder | undefined | null, name: string) {
    if (parent) {
      this.parent = parent
      this._dirname = sanitizeName(name)
    } else {
      this._dirname = path.resolve(name)
    }
  }

  get name () { return this._dirname }
  get path (): string {
    const { parent, _dirname } = this
    if (!_dirname) {
      throw new Error('Folder\'s path is undefined')
    }
    if (parent) {
      return path.join(parent.path, _dirname)
    }
    return _dirname
  }

  async access () {
    if (this._accessed) {
      return
    } else {
      await makeDir(this.path)
      this._accessed = true
    }
  }

  async close () {
    delete this._dirname
    if (this.parent) {
      this.parent.children.delete(this)
    }
  }

  async remove () {
    const { children } = this
    if (!children.size) {
      throw new Error('Folder isn\'t empty')
    }
    const fpath = this.path
    await this.close()
    await pfs.rmdir(fpath)
  }

  get renameable () { return !!this.parent }
  async rename (name: string) {
    if (!this.parent) {
      throw new Error('Folder can\'t be renamed')
    }
    const newName = sanitizeName(name)
    if (!newName) {
      throw new Error('Folder\'s name is invalid')
    }
    const oldName = this._dirname
    this._dirname = newName
    this._accessed = false
    if (oldName) {
      if (newName === oldName) {
        return
      }
      try {
        const parentDir = this.parent.path
        await pfs.rename(
          path.join(parentDir, oldName),
          path.join(parentDir, newName))
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err
        }
      }
    }
    return
  }

  requestFolder (name: string): Folder {
    const entry = new Folder(this, name)
    this.children.add(entry)
    return entry
  }

  requestFile (name: string): File {
    const entry = new File(this, name)
    this.children.add(entry)
    return entry
  }
}

export class File implements FSItem {
  readonly parent: Folder
  private _filename?: string

  constructor (parent: Folder, name: string) {
    this.parent = parent
    this._filename = sanitizeName(name)
  }

  get path (): string {
    const { parent, _filename } = this
    if (!_filename) {
      throw new Error('Filename is not set')
    }
    return path.join(parent.path, _filename)
  }

  async access () {
    if (!this._filename) {
      throw new Error('Filename is not set')
    }
    return
  }

  async rename (name: string) {
    const newName = sanitizeName(name)
    if (!newName) {
      throw new Error('File\'s name is invalid')
    }
    const oldName = this._filename
    this._filename = newName
    if (oldName) {
      if (newName === oldName) {
        return
      }
      try {
        const parentDir = this.parent.path
        await pfs.rename(
          path.join(parentDir, oldName),
          path.join(parentDir, newName))
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err
        }
      }
    }
  }

  async close () {
    delete this._filename
    this.parent.children.delete(this)
  }

  async remove () {
    await this.access()
    const fpath = this.path
    await this.close()
    try {
      await pfs.unlink(fpath)
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
  }

  async read () {
    await this.access()
    return pfs.readFile(this.path)
  }

  async write (content: string | Buffer) {
    await this.parent.access()
    await this.access()
    await pfs.writeFile(this.path, content)
  }
}
