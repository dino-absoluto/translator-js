/**
 * @file Default context
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
import { flow, trim } from '../../utils/flow'
import { JSDOM } from 'jsdom'
/* code */

const Node = flow(new JSDOM()).then(dom => {
  return dom.window.Node
}).get()

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
  abstract requestFile (
    name: string,
    fn: ContextCallback): void

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
          tt = `[${tok.text}](${tok.url})`
          break
        }
        case 'image': {
          tt = `![${tok.text}](${tok.url})`
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
          .get() ||
        flow([...node.children]).then(children => {
          let text = ''
          for (const node of children) {
            if (node.nodeType === Node.TEXT_NODE) {
              text += node.textContent
            }
          }
          return text
        }).get() || node.textContent)
        if (text) {
          const ruby = flow(node.querySelector('rt')).then(rt => {
            return trim(rt.textContent)
          }).get()
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
  requestFile (name: string, get: ContextCallback) {
    let data = get(name)
    if (Array.isArray(data)) {
      this.text.push([name, data as string[]])
    } else {
      this.bufs.push([name, data as Buffer])
    }
  }
}
