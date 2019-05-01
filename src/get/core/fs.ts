/**
 * @author Dino <dinoabsoluto+dev@gmail.com>
 * @license
 * Copyright 2019 Dino <dinoabsoluto+dev@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
    }).value
}

interface FSItem {
  parent?: Folder
  path: string
  real (): Promise<void>
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

  async real () {
    if (this._accessed) {

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
      throw new Error('folder is not empty')
    }
    const fpath = this.path
    await this.close()
    await pfs.rmdir(fpath)
  }

  get renameable () { return !!this.parent }
  async rename (name: string) {
    if (!this.parent) {
      throw new Error('folder cannot be renamed')
    }
    const newName = sanitizeName(name)
    if (!newName) {
      throw new Error('folder name is invalid')
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
      throw new Error('filename is not set')
    }
    return path.join(parent.path, _filename)
  }

  async real () {
    if (!this._filename) {
      throw new Error('filename is not set')
    }
  }

  async rename (name: string) {
    const newName = sanitizeName(name)
    if (!newName) {
      throw new Error('filename is invalid')
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

  async access (mode?: number) {
    return pfs.access(this.path, mode)
  }

  async remove () {
    await this.real()
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
    await this.real()
    return pfs.readFile(this.path)
  }

  async write (content: string | Buffer) {
    await this.parent.real()
    await this.real()
    await pfs.writeFile(this.path, content)
  }
}
