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

export default class Series extends Base {
  constructor (props) {
    const meta = Series.parseMeta(props)
    super(meta)
    Object.defineProperties(this, {
      sourceURL: { enumerable: true, get: () => this.props.sourceURL }
    })
  }

  static parseMeta (props) {
    try {
      let url = new URL(props.source)
      let name = props.name || filenamify(`${url.host}${url.pathname}`)
      return {
        sourceURL: url,
        targetDir: name
      }
    } catch (err) {
      try {
        let fname = path.join(props.source, 'index.json')
        let data = JSON.parse(fs.readFileSync(fname, 'utf8'))
        data.sourceURL = new URL(data.sourceURL)
        return Object.assign(data, {
          targetDir: path.dirname(fname)
        })
      } catch (error) {
        throw new Error('Failed to read index.json')
      }
    }
  }

  refresh () {
  }
}
