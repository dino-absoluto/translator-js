/**
 * @author Dino <dinoabsoluto+dev@gmail.com>
 * @license
 * Translator-js - Scripts to facilitate Japanese webnovel
 * Copyright (C) 2019 Dino <dinoabsoluto+dev@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */
/* imports */
import cookie = require('cookie')
import nodeFetch, { Request, RequestInit, Headers } from 'node-fetch'
import pLimit from 'p-limit'
/* -imports */

const syosetuLimit = pLimit(1)

function fetch (href: string | Request, init?: RequestInit) {
  let url = typeof href === 'string'
    ? new URL(href.toString())
    : new URL(href.url)
  if (url.host.endsWith('syosetu.com')) {
    if (!init) {
      init = {}
    }
    const headers = new Headers(init.headers)
    init.headers = headers
    if (/^(novel18|noc|mnlt|mid)./.test(url.hostname)) {
      headers.set('Cookie', cookie.serialize('over18', 'yes'))
    }
    return syosetuLimit(() => nodeFetch(href, init))
  } else {
    return nodeFetch(href, init)
  }
}

export default fetch
