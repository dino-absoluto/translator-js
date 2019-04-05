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
/* -imports */

interface GotOptions {
  headers?: {
    cookie?: string
  }
}

const syosetuLimit = pLimit(1)

const got = (href: gotBase.GotUrl, config: GotOptions = {}) => {
  let url = new URL(href.toString())
  if (url.host.endsWith('.syosetu.com')) {
    config.headers = Object.assign({}, config.headers)
    if (/^(novel18|noc|mnlt|mid)./.test(url.hostname)) {
      config.headers.cookie = cookie.serialize('over18', 'yes')
    }
    return syosetuLimit(() => gotBase(url, config))
  } else {
    return gotBase(href, config)
  }
}

export default got
