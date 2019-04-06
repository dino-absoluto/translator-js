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
import { Provider, Novel, NovelData, Chapter, RenderFn } from './common'
import { trim, flow } from '../../utils/flow'
import { fetchDOM, fetchFile } from './utils'
import { Context } from './context'
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
    const url = this.url.toString()
    const doc = await fetchDOM(url)
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
    const tokensArray = nodes.map(Context.tokenize)
    const imagePromises: ReturnType<typeof fetchFile>[] = []
    for (const tokens of tokensArray) {
      for (const tok of tokens) {
        if (tok.type === 'image') {
          imagePromises.push(fetchFile(tok.url))
        }
      }
    }
    const images = await Promise.all(imagePromises)
    this.content = (ctx) => {
      ctx.requestFile(this.name + '.txt', (_name) => {
        const sections = tokensArray.map(toks => ctx.render(toks))
        sections.unshift(this.name)
        return sections
      })
      for (const img of images) {
        ctx.requestFile(img.name, () => img.buf)
      }
    }
  }
}

interface SyosetuNovelData extends NovelData {
  readonly over18?: boolean
  readonly url: string
}

export class SyosetuNovel implements Novel, SyosetuNovelData {
  readonly id: string
  readonly url: string
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
      throw new Error('wrong domain')
    }
    const paths = url.pathname.split('/', 2)
    if (paths.length < 2) {
      throw new Error('invalid pathname')
    }
    this.id = paths[1]
    this.url = this.indexURL
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
    const doc = await fetchDOM(url)
    const main = doc.getElementById('contents_main')
    if (!main) {
      throw new Error('failed to find contents')
    }
    {
      // get title
      const h1 = main.getElementsByTagName('h1')[0]
      if (!h1) {
        throw new Error('failed to parse header')
      }
      this.name = h1.textContent || undefined
    }
    {
      // parse table
      const lines = main.querySelectorAll('#noveltable1 > tbody > tr > td')
      if (lines.length !== 4) {
        throw new Error('failed to parse table')
      }
      this.description = trim(lines[0].textContent)
      this.author = trim(lines[1].textContent)
      this.keywords = flow(trim(lines[2].textContent)).then(
        s => s.split(/\s+/g)
      ).value
      this.genre = flow(trim(lines[3].textContent)).then(
        s => s.split('〔', 1)[0]
      ).value
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
        throw new Error('failed to detect novel type')
      }
      if (type.textContent.trim() === '短編') {
        size = 1
      } else {
        let node = type.nextSibling
        if (!node || !node.textContent) {
          throw new Error('failed to detect novel size')
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
    const doc = await fetchDOM(url)
    let indexBox = doc.getElementsByClassName('index_box')[0]
    if (!indexBox) {
      throw new Error('failed to get index_box')
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
