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
import { Provider, Novel, NovelData, Chapter, RenderFn } from './common'
import { trim, flow } from '../../utils/flow'
import { fetchDOM, fetchFile } from './utils'
import { Context } from './context'
/* code */

export class SyosetuChapter implements Chapter {
  private url: URL
  public group?: string
  public name: string
  public updateId?: string
  public content?: RenderFn
  public constructor (options: {
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

  public async fetch (): Promise<void> {
    const url = this.url.toString()
    const doc = await fetchDOM(url)
    const main = doc.getElementById('novel_contents')
    if (!main) {
      return
    }
    flow(main.querySelector('.novel_subtitle'))
      .then((node): string | undefined => trim(node.textContent))
      .then((text): void => {
        this.name = text
      })
    const nodes: Element[] = []
    ;[
      '#novel_p',
      '#novel_honbun',
      '#novel_a'
    ].forEach((id): void =>
      void flow(main.querySelector(id))
        .then((node): void => {
          nodes.push(node)
        })
    )
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
    this.content = (ctx): void => {
      for (const img of images) {
        ctx.requestFile(img.name, (filename): Buffer => {
          ctx.mapURL(img.url, filename)
          return img.buf
        })
      }
      ctx.requestFile(this.name + '.txt', (): string[] => {
        const sections = tokensArray.map((toks): string => ctx.render(toks))
        sections.unshift(this.name)
        return sections
      })
    }
  }
}

interface SyosetuNovelData extends NovelData {
  readonly over18?: boolean
  readonly url: string
}

export class SyosetuNovel implements Novel, SyosetuNovelData {
  public readonly id: string
  public readonly url: string
  public readonly over18: boolean
  public name?: string
  public author?: string
  public description?: string
  public keywords?: string[]
  public genre?: string
  public status?: {
    completed: boolean
    size: number
  }

  public constructor (url: URL) {
    const hostname = url.hostname
    if (hostname.indexOf('novel18.') === 0) {
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

  public get rootURL (): string {
    return `https://${this.over18 ? 'novel18' : 'ncode'}.syosetu.com/`
  }

  public get infoURL (): string {
    return `${this.rootURL}novelview/infotop/ncode/${this.id}/`
  }

  public get indexURL (): string {
    return `${this.rootURL}${this.id}/`
  }

  public async fetch (): Promise<void> {
    const url = this.infoURL
    const doc = await fetchDOM(url)
    const main = doc.getElementById('contents_main')
    if (!main) {
      console.log(doc.body.innerHTML)
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
        (s): string[] => s.split(/\s+/g)
      ).value
      this.genre = flow(trim(lines[3].textContent)).then(
        (s): string => s.split('〔', 1)[0]
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
  }

  public async fetchIndex (): Promise<SyosetuChapter[]> {
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

const fromURL = (url: URL): SyosetuNovel | undefined => {
  try {
    return new SyosetuNovel(url)
  } catch {

  }
}

const Syosetu: Provider = {
  acceptDomains: [
    'ncode.syosetu.com',
    'novel18.syosetu.com'
  ],
  fromURL
}

export default Syosetu
