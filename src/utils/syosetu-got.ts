/**
 * @file Syosetu, override default options
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
import cookie = require('cookie')
import gotBase = require('got')
import pLimit from 'p-limit'
import {
  GotUrl,
  GotPromise,
  GotJSONOptions,
  GotFormOptions,
  GotBodyOptions } from 'got'
/* -imports */

const syosetuLimit = pLimit(1)

function got (url: GotUrl, options: GotJSONOptions): GotPromise<any>
function got (url: GotUrl, options?: GotFormOptions<string>): GotPromise<string>
function got (url: GotUrl, options: GotFormOptions<null>): GotPromise<Buffer>
function got (url: GotUrl, options: GotBodyOptions<string>): GotPromise<string>
function got (url: GotUrl, options?: GotBodyOptions<null>): GotPromise<Buffer>
function got (href: gotBase.GotUrl, options?: any) {
  let url = new URL(href.toString())
  if (url.host.endsWith('.syosetu.com')) {
    if (!options) {
      options = {}
    }
    options.headers = Object.assign({}, options.headers)
    if (/^(novel18|noc|mnlt|mid)./.test(url.hostname)) {
      options.headers.cookie = cookie.serialize('over18', 'yes')
    }
    return syosetuLimit(() => gotBase(url, options))
  } else {
    return gotBase(href, options)
  }
}

export default got
