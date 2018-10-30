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

export default class Patch {
  constructor (props = {}) {
    props = Object.assign({}, props)
    Object.defineProperties(this, {
      props: { writable: true, value: props }
    })
  }

  async patch (patch, run = true) {
    if (typeof patch !== 'object') {
      return
    }
    let last = this
    let copy = new this.constructor(Object.assign({}, last.props, {
      last, patch
    }))
    if (run) {
      await copy.run()
    }
    return copy
  }

  async run () {
    const { props } = this
    const { last, patch } = props
    delete props.last
    delete props.patch
    if (!patch) {
      return
    }
    if (await this.shouldUpdate(last, patch)) {
      await this.willUpdate(last, patch)
      this.props = Object.assign({}, this.props, patch)
      await this.update(last)
      await this.didUpdate()
    } else {
      this.props = Object.assign({}, this.props, patch)
    }
  }

  async isPending () {
    const { props } = this
    return !!(props.patch && await this.shouldUpdate(props.last, props.patch))
  }

  shouldUpdate (last, patch) {
    return !!(patch && Object.getOwnPropertyNames(patch).length !== 0)
  }

  willUpdate (last, patch) {
  }

  update (last) {
  }

  didUpdate () {
  }
}