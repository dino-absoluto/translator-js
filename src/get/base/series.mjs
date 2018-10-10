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
import filenamify from 'filenamify'
/* -imports */

export default class Series extends Base {
  constructor (props) {
    const meta = Series.parseMeta(props)
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
    try {
      let url = new URL(props.source)
      let name = props.name || filenamify(`${url.host}${url.pathname}`)
      return {
        sourceURL: url,
        targetDir: path.resolve(props.chdir || '', name)
      }
    } catch (err) {
      try {
        let fname = path.join(props.source, 'index.json')
        let data = JSON.parse(fs.readFileSync(fname, 'utf8'))
        data.sourceURL = new URL(data.sourceURL)
        return Object.assign(data, {
          targetDir: path.resolve(props.chdir || '', path.dirname(fname))
        })
      } catch (error) {
        throw new Error('Failed to read index.json')
      }
    }
  }

  updateData (options) {
    const { props, Volume, Chapter } = this
    const { volumes, chapters } = options
    if (volumes) {
      if (!props.volumes) {
        props.volumes = []
      }
      props.volumes = volumes.map((data, index) => {
        let vol = props.volumes[index]
        if (!vol) {
          vol = new Volume({
            index,
            base: this.targetDir
          })
        }
        vol.setProps(data)
        return vol
      })
    }
    if (chapters) {
      if (!props.chapters) {
        props.chapters = []
      }
      props.chapters = chapters.map((data, index) => {
        let ch = props.chapters[index]
        let volume = Number.isInteger(data.volume) && props.volumes[data.volume]
        if (!ch) {
          ch = new Chapter({
            index,
            volume
          })
          props.chapters[index] = ch
        }
        if (!volume) {
          // Vol matching failed
        }
        ch.setProps(Object.assign({}, data, {
          volume
        }))
        return ch
      })
    }
  }

  refresh () {
  }
}
