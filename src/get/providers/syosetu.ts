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
import { Provider, Novel, Chapter, Content } from '../core/provider'
import got from '../../utils/syosetu-got'
import { JSDOM } from 'jsdom'
/* code */

const ifStr = (text: string | void | null, fn?: (v: string) => any) => {
  if (!text) {
    return
  }
  text = text.trim()
  if (!text.length) {
    return
  }
  return fn ? fn(text) : text
}

const ifTrue = <T>(value: T | void | null, fn: (v: T) => any): any => {
  if (!value) {
    return
  }
  return fn(value)
}

export class SyosetuChapter implements Chapter {
  private url: URL
  group?: string
  name: string
  updateId?: string
  content?: Content
  constructor (options: {
    url: URL
    group?: string
    name: string
    updateId?: string
  }) {
    this.url = options.url
    this.group = options.group
    this.name = options.name
    this.updateId = options.updateId
  }

  async fetch () {
    return
  }
}

export class SyosetuNovel implements Novel {
  readonly id: string
  readonly over18: boolean
  name?: string
  author?: string
  description?: string
  keywords?: string[]
  genre?: string
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
      throw new Error('Failed to find contents')
    }
    {
      // get title
      const h1 = main.getElementsByTagName('h1')[0]
      if (!h1) {
        throw new Error('Failed to parse header')
      }
      this.name = h1.textContent || undefined
    }
    {
      // parse table
      const lines = main.querySelectorAll('#noveltable1 > tbody > tr > td')
      if (lines.length !== 4) {
        throw new Error('Failed to parse table')
      }
      this.description = ifStr(lines[0].textContent)
      this.author = ifStr(lines[1].textContent)
      this.keywords = ifStr(lines[2].textContent,
        s => s.split(/\s+/g))
      this.genre = ifStr(lines[3].textContent,
        s => s.split('〔', 1)[0])
    }
    {
      // status
      let completed = true
      let size = 0
      let type = main.querySelector('#noveltype_notend')
      if (type) {
        completed = false
      } else {
        type = main.querySelector('#noveltype')
      }
      if (!type || !type.textContent) {
        throw new Error('Failed to detect novel type')
      }
      if (type.textContent.trim() === '短編') {
        size = 1
      } else {
        let node = type.nextSibling
        if (!node || !node.textContent) {
          throw new Error('Failed to detect novel size')
        }
        let text = node.textContent.match(/(?<=全)\d+(?=部分)/)
        if (text && text[0]) {
          size = parseInt(text[0], 10)
        }
      }
      this.status = {
        completed,
        size
      }
    }
    return
  }

  async fetchIndex () {
    const url = this.indexURL
    let { window: { document: doc } } =
      new JSDOM((await got(url)).body, { url })
    let indexBox = doc.getElementsByClassName('index_box')[0]
    if (!indexBox) {
      throw new Error('Failed to get index_box')
    }
    const chapters = []
    let group: string | undefined
    for (const node of indexBox.children) {
      if (node.classList.contains('chapter_title')) {
        group = ifStr(node.textContent)
        continue
      } else if (node.classList.contains('novel_sublist2')) {
        if (node.children.length < 2) {
          continue
        }
        let name: string | undefined
        let url: URL | undefined
        let timestamp: string | undefined
        {
          const col = node.children[0]
          const a = col.firstElementChild
          if (a && a.tagName === 'A') {
            let link = a as HTMLLinkElement
            name = ifStr(a.textContent)
            url = new URL(link.href)
          }
        }
        {
          const col = node.children[1]
          const span = col.firstElementChild
          if (span) {
            timestamp = ifStr(span.getAttribute('title'))
          } else {
            timestamp = ifStr(col.textContent)
          }
        }
        if (name && url) {
          let chapter = new SyosetuChapter({
            url,
            group,
            name,
            updateId: timestamp
          })
          chapters.push(chapter)
        }
      }
    }
    return chapters
  }
}

const fromURL = (url: URL) => {
  try {
    return new SyosetuNovel(url)
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
