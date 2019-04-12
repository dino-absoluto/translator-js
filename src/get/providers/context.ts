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
import { flow, trim } from '../../utils/flow'
import { JSDOM } from 'jsdom'
import * as path from 'path'
import filenamify = require('filenamify')
/* code */

const Node = flow(new JSDOM()).then(dom => {
  return dom.window.Node
}).value

interface TokenBr {
  type: 'br'
}

interface TokenString {
  type: 'text'
  text: string
}

interface TokenRuby {
  type: 'ruby'
  text: string
  ruby: string
}

interface TokenImage {
  type: 'image'
  url: string
  text: string
}

interface TokenLink {
  type: 'link'
  url: string
  text: string
}

export type Token = TokenBr | TokenString | TokenRuby | TokenImage | TokenLink

const isElementNode = (node: Node): node is HTMLElement =>
  node.nodeType === Node.ELEMENT_NODE

export type ContextCallback = (name: string) => Buffer | string[]

export abstract class Context {
  private names = new Set<string>()
  private urls = new Map<string, string>()
  abstract requestFile (
    name: string,
    fn: ContextCallback): void
  resolveName (name: string) {
    name = path.normalize(trim(name) || '')
    if (name === '.') {
      return
    }
    const ext = path.extname(name)
    const base = filenamify(path.basename(name, ext))
    name = base + ext
    const { names } = this
    if (!names.has(name)) {
      names.add(name)
      return name
    }
    for (let i = 1; i < 100; i++) {
      const name = `${base} (${i})${ext}`
      if (!names.has(name)) {
        names.add(name)
        return name
      }
    }
    return ''
  }

  mapURL (url: string, filename: string) {
    this.urls.set(url, filename)
  }

  resolveURL (url: string): string {
    return this.urls.get(url) || url
  }

  parseNode (node: Node): string {
    return this.render(Context.tokenize(node))
  }

  render (tokens: Token[]): string {
    let text = ''
    for (const tok of tokens) {
      let tt: string
      switch (tok.type) {
        case 'text': {
          tt = tok.text
          break
        }
        case 'ruby': {
          tt = `${tok.text}(${tok.ruby})`
          break
        }
        case 'link': {
          tt = `[${tok.text}](${this.resolveURL(tok.url)})`
          break
        }
        case 'image': {
          tt = `![${tok.text}](${this.resolveURL(tok.url)})`
          break
        }
        case 'br': {
          tt = '\n'
          break
        }
        default:
          tt = ''
          break
      }
      text += tt
    }
    return text
  }

  static tokenizeArray (nodes: NodeList): Token[] {
    return [...nodes].reduce((acc, cnode) => {
      return acc.concat(Context.tokenize(cnode))
    }, [] as Token[])
  }

  static tokenize (node: Node): Token[] {
    if (node.nodeType === Node.TEXT_NODE) {
      return [{
        type: 'text',
        text: (node.textContent || '').replace(/^\n|\n$/g, '')
      }]
    }
    if (!isElementNode(node)) {
      return []
    }
    switch (node.nodeName) {
      case 'RUBY': {
        const text = trim(flow(node.querySelector('rb'))
          .then(rb => rb.textContent)
          .value ||
        flow([...node.children]).then(children => {
          let text = ''
          for (const node of children) {
            if (node.nodeType === Node.TEXT_NODE) {
              text += node.textContent
            }
          }
          return text
        }).value || node.textContent)
        if (text) {
          const ruby = flow(node.querySelector('rt')).then(rt => {
            return trim(rt.textContent)
          }).value
          if (ruby && text !== ruby) {
            return [{
              type: 'ruby',
              text,
              ruby
            }]
          } else {
            return [{
              type: 'text',
              text
            }]
          }
        } else {
          return []
        }
      }
      case 'BR': {
        if (flow(node.nextSibling)
          .then(n => n.nodeType === Node.TEXT_NODE && n.textContent || undefined)
          .then(t => t.startsWith('\n'))) {
          return []
        }
        return [{
          type: 'br'
        }]
      }
      case 'A': {
        const a = node as HTMLLinkElement
        const tok: Token = {
          type: 'link',
          text: a.textContent || a.href,
          url: a.href
        }
        const tokens = [...a.querySelectorAll('img')].reduce(
          (all, node) => all.concat(this.tokenize(node)), [] as Token[])
        if (tokens.length) {
          tokens.push({
            type: 'br'
          })
          tokens.push(tok)
          return tokens
        }
        return [tok]
      }
      case 'IMG': {
        const img = node as HTMLImageElement
        return [{
          type: 'image',
          text: img.alt,
          url: img.src
        }]
      }
      case 'IFRAME':
      case 'VIDEO':
      case 'EMBEDED': {
        return []
      }
      case 'P': {
        const tokens = Context.tokenizeArray(node.childNodes)
        tokens.push({
          type: 'br'
        })
        return tokens
      }
      default: {
        return Context.tokenizeArray(node.childNodes)
      }
    }
    // return []
  }
}

export class SimpleContext extends Context {
  text: ([string, string[]])[] = []
  bufs: ([string, Buffer])[] = []
  requestFile (unsafeName: string, get: ContextCallback) {
    const name = this.resolveName(unsafeName)
    if (!name) {
      return
    }
    let data = get(name)
    if (Array.isArray(data)) {
      this.text.push([name, data as string[]])
    } else {
      this.bufs.push([name, data as Buffer])
    }
  }
}
