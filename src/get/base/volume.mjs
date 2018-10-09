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
import filenamify from 'filenamify'
/* -imports */

export default class Volume extends Base {
  constructor (props) {
    super(props)
    Object.defineProperties(this, {
      title: { enumerable: true, get: () => props.title },
      index: { enumerable: true, get: () => props.index }
    })
  }

  get base () {
    const { props } = this
    if (props.base) {
      return path.resolve(props.base)
    } else {
      return process.cwd()
    }
  }

  get filename () {
    const { props } = this
    const name = filenamify(`${
      props.index.toString().padStart(2, '0')
    } ${props.title}`)
    return name
  }

  get relative () {
    return this.filename
  }

  get absolute () {
    return path.resolve(this.base, this.relative)
  }
}
