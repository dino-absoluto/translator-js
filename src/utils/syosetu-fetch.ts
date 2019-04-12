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
