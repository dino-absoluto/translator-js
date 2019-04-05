/**
 * @file Syosetu provider
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
import { Provider, Novel, Chapter, RenderFn } from './common'
import got from '../../utils/syosetu-got'
import { trim, flow } from '../../utils/flow'
import { JSDOM } from 'jsdom'
/* code */

export class SyosetuChapter implements Chapter {
  private url: URL
  group?: string
  name: string
  updateId?: string
  content?: RenderFn
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
    const { url } = this
    let { window: { document: doc } } =
      new JSDOM((await got(url)).body, { url: url.toString() })
    const main = doc.getElementById('novel_contents')
    if (!main) {
      return
    }
    flow(main.querySelector('.novel_subtitle'))
      .then(node => trim(node.textContent))
      .then(text => {
        this.name = text
      })
    const nodes: Element[] = []
    ;[
      '#novel_p',
      '#novel_honbun',
      '#novel_a'
    ].forEach(id => flow(main.querySelector(id)).then(node => {
      nodes.push(node)
    }))
    this.content = (fmt) => {
      let sections = nodes.map(node =>
        fmt.parseNode(node).trim())
      fmt.requestFile(this.name + '.txt', (_name) => {
        return sections
      })
    }
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
      this.description = trim(lines[0].textContent)
      this.author = trim(lines[1].textContent)
      this.keywords = flow(trim(lines[2].textContent)).then(
        s => s.split(/\s+/g)
      ).get()
      this.genre = flow(trim(lines[3].textContent)).then(
        s => s.split('〔', 1)[0]
      ).get()
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
        group = trim(node.textContent)
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
            name = trim(a.textContent)
            url = new URL(link.href)
          }
        }
        {
          const col = node.children[1]
          const span = col.firstElementChild
          if (span) {
            timestamp = trim(span.getAttribute('title'))
          } else {
            timestamp = trim(col.textContent)
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
