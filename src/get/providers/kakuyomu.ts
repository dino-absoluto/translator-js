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
import once = require('lodash/once')
/* code */

export class KakuyomuChapter implements Chapter {
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
    const main = doc.getElementById('contentMain-inner')
    if (!main) {
      return
    }
    flow(main.querySelector('.widget-episodeTitle'))
      .then((node): string | undefined => trim(node.textContent))
      .then((text): void => {
        this.name = text
      })
    const nodes: Element[] = []
    ;[
      '.widget-episode'
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

interface KakuyomuNovelData extends NovelData {
  readonly url: string
}

export class KakuyomuNovel implements Novel, KakuyomuNovelData {
  public readonly id: string
  public readonly url: string
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
    const paths = url.pathname.split('/', 3)
    if (paths.length < 2) {
      throw new Error('invalid pathname')
    }
    this.id = paths[2]
    this.url = this.indexURL
  }

  public get rootURL (): string {
    return `https://kakuyomu.jp/works/`
  }

  public get indexURL (): string {
    return `${this.rootURL}${this.id}`
  }

  public getIndex = once(async (): Promise<Document> => {
    const url = this.indexURL
    const doc = await fetchDOM(url)
    return doc
  })

  public async fetch (): Promise<void> {
    const doc = await this.getIndex()
    {
      const e = doc.getElementById('workTitle')
      this.name = trim(e && e.textContent)
    }
    {
      const e = doc.getElementById('workAuthor-activityName')
      this.author = trim(e && e.textContent)
    }
    {
      const e = doc.getElementById('workGenre')
      this.genre = trim(e && e.textContent)
    }
    {
      let texts: string[] = []
      {
        const e = doc.getElementById('catchphrase-body')
        const t = trim(e && e.textContent)
        if (t) {
          texts.push(t)
        }
      }
      {
        const e = doc.getElementById('catchphrase-author')
        const t = trim(e && e.textContent)
        if (t) {
          texts.push('- ' + t + '\n')
        }
      }
      {
        const e = doc.getElementById('introduction')
        const t = trim(e && e.textContent)
        if (t) {
          texts.push(t)
        }
      }
      this.description = texts.join('\n')
    }
    {
      const data = doc.querySelectorAll('.widget-credit > dd')
      let e = data[0]
      let completed = false
      let size = 0
      if (e && e.textContent === '完結済') {
        completed = true
      }
      e = data[1]
      if (e && e.textContent) {
        size = Number.parseInt(e.textContent, 10)
      }
      this.status = {
        completed,
        size
      }
      e = data[4]
      if (e) {
        const keywords: string[] = []
        this.keywords = keywords
        for (const a of e.querySelectorAll('a')) {
          const text = trim(a.textContent)
          if (text) {
            keywords.push(text)
          }
        }
      }
    }
  }

  public async fetchIndex (): Promise<KakuyomuChapter[]> {
    const doc = await this.getIndex()
    let indexBox = doc.getElementsByClassName('widget-toc-items')[0]
    if (!indexBox) {
      throw new Error('failed to get index_box')
    }
    const chapters = []
    let group: string | undefined
    for (const node of indexBox.children) {
      if (node.classList.contains('widget-toc-chapter')) {
        group = trim(node.textContent)
        continue
      } else if (node.classList.contains('widget-toc-episode')) {
        if (node.children.length < 1) {
          continue
        }
        const a = node.children[0]
        if (!a) {
          continue
        }
        let name: string | undefined
        let url: URL | undefined
        let timestamp: string | undefined
        if (a && a.tagName === 'A') {
          let link = a as HTMLLinkElement
          url = new URL(link.href)
        }
        {
          const col = a.children[0]
          name = trim(col.textContent)
        }
        {
          const col = a.children[1]
          timestamp = trim(col.getAttribute('datetime'))
        }
        if (name && url) {
          let chapter = new KakuyomuChapter({
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

const fromURL = (url: URL): KakuyomuNovel | undefined => {
  try {
    return new KakuyomuNovel(url)
  } catch {

  }
}

const Syosetu: Provider = {
  acceptDomains: [
    'kakuyomu.jp'
  ],
  fromURL
}

export default Syosetu
