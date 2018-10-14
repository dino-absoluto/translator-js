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
import BaseChapter from './chapter'
import BaseVolume from './volume'
import Base from './base'
import path from 'path'
import fs from 'fs'
import makeDir from 'make-dir'
import filenamify from 'filenamify'
import chalk from 'chalk'
import readline from 'readline'
/* -imports */

export default class Series extends Base {
  constructor (props, parsed = false) {
    const meta = parsed ? props : Series.parseMeta(props)
    super(meta)
    props = this.props
    if (props.volumes) {
      const { Volume } = this
      props.volumes = props.volumes.map((vol, index) => {
        return new Volume(Object.assign({}, vol, {
          index,
          base: this.targetDir
        }))
      })
    } else {
      props.volumes = []
    }
    if (props.chapters) {
      const { Chapter } = this
      props.chapters = props.chapters.map((ch, index) => {
        let vol = (Number.isInteger(ch.volume) && props.volumes[ch.volume])
        return new Chapter(Object.assign({}, ch, {
          index,
          volume: vol
        }))
      })
    } else {
      props.chapters = []
    }
    Object.defineProperties(this, {
      sourceURL: { enumerable: true, get: () => this.props.sourceURL },
      volumes: { enumerable: true,
        get: () =>
          (this.props.volumes.length && this.props.volumes) || undefined },
      chapters: { enumerable: true,
        get: () =>
          (this.props.chapters.length && this.props.chapters) || undefined }
    })
  }

  get Chapter () {
    return BaseChapter
  }

  get Volume () {
    return BaseVolume
  }

  get targetDir () {
    return path.resolve(this.props.targetDir)
  }

  static parseMeta (props) {
    let accepted = {
      verbose: props.verbose,
      overwrite: props.overwrite
    }
    try {
      let url = new URL(props.source)
      let name = props.name || filenamify(`${url.host}${url.pathname}`)
      let targetDir = path.resolve(props.chdir || '', name)
      let data = {}
      try {
        let fname = path.join(targetDir, 'index.json')
        let fdata = JSON.parse(fs.readFileSync(fname, 'utf8'))
        Object.assign(data, fdata)
      } catch (err) {
      }
      return Object.assign(data, {
        sourceURL: url,
        targetDir
      }, accepted)
    } catch (err) {
      try {
        let fname = path.resolve(path.join(props.source, 'index.json'))
        let data = JSON.parse(fs.readFileSync(fname, 'utf8'))
        let targetDir = path.dirname(fname)
        data.sourceURL = new URL(data.sourceURL)
        return Object.assign(data, {
          targetDir
        }, accepted)
      } catch (error) {
        throw new Error('Failed to read index.json')
      }
    }
  }

  shouldUpdate () {
    return true
  }

  async willUpdate (last, patch) {
    const { props, Volume, Chapter } = this
    const { volumes, chapters } = patch
    if (volumes) {
      patch.volumes = await Promise.all(volumes.map(async (data, index) => {
        let config = (props.volumes[index] && props.volumes[index].props) || {}
        let vol = new Volume(Object.assign(config, {
          index,
          base: this.targetDir
        }))
        await vol.setProps(Object.assign({}, data, {
          index
        }))
        return vol
      }))
    }
    if (chapters) {
      const defers = []
      patch.chapters = await Promise.all(chapters.map(async (data, index) => {
        let volume = Number.isInteger(data.volume) && patch.volumes[data.volume]
        let config = (props.chapters[index] && props.chapters[index].props) || {}
        let ch = new Chapter(Object.assign(config, {
          index,
          base: this.targetDir,
          overwrite: props.overwrite
        }))
        if (!volume) {
          // Vol matching failed
        }
        let defer = await ch.setProps(Object.assign({}, data, {
          index,
          volume,
          base: this.targetDir
        }), true)
        if (defer) {
          defers.push([ch, defer])
        }
        return ch
      }))
      /* defer tasks */
      patch.defers = defers
      patch.delta = chapters.length -
        ((props.chapters && props.chapters.length) || 0)
    }
    return super.willUpdate(last, patch)
  }

  async saveIndex () {
    const fpath = path.join(this.props.targetDir, 'index.json')
    fs.writeFileSync(fpath, JSON.stringify(this, null, 1), 'utf8')
  }

  async update () {
    const { props } = this
    const fpath = path.join(props.targetDir, 'index.json')
    await makeDir(props.targetDir)
    fs.writeFileSync(fpath, JSON.stringify(this, null, 1), 'utf8')
    if (props.defers && props.defers.length) {
      const length = props.defers.length
      const shrink = props.defers.length > 16
      if (props.verbose) {
        process.stdout.write(chalk`  {green [${
          props.chapters.length}]} {green ->} `)
        if (props.delta) {
          process.stdout.write(chalk`{green New ${
            props.delta}}{gray ,} `)
        }
        console.log(chalk`{red Updated ${props.defers.length}}`)
      }
      if (shrink) {
        for (const [index, [, defer]] of props.defers.entries()) {
          await defer()
          await this.saveIndex()
          readline.clearLine(process.stdout, 0)
          readline.cursorTo(process.stdout, 0)
          process.stdout.write(chalk`  {green ->} {gray [${index + 1}/${length}]}`)
        }
        readline.clearLine(process.stdout, 0)
        readline.cursorTo(process.stdout, 0)
        console.log(chalk`  {gray [${length}/${length}]}`)
      } else {
        for (const [index, [ch, defer]] of props.defers.entries()) {
          void index
          await defer()
          await ch.printInfo()
          await this.saveIndex()
        }
      }
      this.saveIndex()
      if (props.verbose) {
        console.log(chalk`  {green Completed}`)
      }
      delete props.defers
      delete props.delta
    }
  }

  async refresh () {
    const { props } = this
    if (props.verbose) {
      const maxWidth = process.stdout.columns
      let output = path.relative('.', this.targetDir)
      let width = 2 + 4 + String(this.sourceURL).length + output.length
      process.stdout.write(chalk`{gray #} {blue ${this.sourceURL}}`)
      if (width > maxWidth) {
        console.log()
      } else {
        process.stdout.write(' ')
      }
      console.log(chalk`{green ->} ${output}`)
    }
    return this.fetch()
  }

  async fetch () {
  }
}
