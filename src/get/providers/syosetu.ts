/**
 * @file index.ts
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
import { Provider, Novel } from '../core/provider'
import got from '../../utils/syosetu-got'
import { JSDOM } from 'jsdom'
/* code */

export class WebNovel implements Novel {
  readonly id: string
  readonly over18: boolean
  name?: string
  author?: string
  description?: string
  keywords?: string[]
  status?: {
    completed: boolean
    size: number
  }

  constructor (url: URL) {
    const hostname = url.hostname
    if (hostname.indexOf('over18.') === 0) {
      this.over18 = true
    } else if (hostname.indexOf('ncode.') === 0) {
      this.over18 = false
    } else {
      throw new Error('Wrong domain')
    }
    const paths = url.pathname.split('/', 2)
    if (paths.length < 2) {
      throw new Error('Invalid pathname')
    }
    this.id = paths[1]
  }

  get rootURL () {
    return `https://${this.over18 ? 'over18' : 'ncode'}.syosetu.com/`
  }

  get infoURL () {
    return `${this.rootURL}novelview/infotop/ncode/${this.id}/`
  }

  get indexURL () {
    return `${this.rootURL}${this.id}/`
  }

  async fetch () {
    const url = this.infoURL
    let { window: { document: doc } } =
      new JSDOM((await got(url)).body, { url })
    const main = doc.getElementById('contents_main')
    if (!main) {
      throw new Error('Content\'s not found')
    }
    {
      // get title
      const h1 = main.getElementsByTagName('h1')[0]
      if (!h1) {
        throw new Error('Header\'s not found')
      }
      this.name = h1.textContent || undefined
    }
    return
  }
}

const fromURL = (url: URL) => {
  try {
    return new WebNovel(url)
  } catch {
    return
  }
}

const Syosetu: Provider = {
  acceptDomains: [
    'ncode.syosetu.com',
    'over18.syosetu.com'
  ],
  fromURL
}

export default Syosetu
