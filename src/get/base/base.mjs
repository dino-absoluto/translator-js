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
/* -imports */

export default class Base {
  constructor (props = {}) {
    props = Object.assign({}, props)
    Object.defineProperties(this, {
      props: { writable: true, value: props }
    })
  }

  setProps (patch) {
    if (typeof patch !== 'object') {
      return
    }
    const last = this.props
    if (this.shouldUpdate(last, patch)) {
      this.willUpdate(last, patch)
      this.props = Object.assign({}, last, patch)
      this.update()
      this.didUpdate()
    } else {
      this.props = Object.assign({}, last, patch)
    }
  }

  shouldUpdate (last, patch) {
    return false
  }

  willUpdate (last, patch) {
  }

  update () {
  }

  didUpdate () {
  }
}
