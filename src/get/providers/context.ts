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
import { Context as AbstractContext, ContextCallback } from './common'
import { flow, trim } from '../../utils/flow'
import { JSDOM } from 'jsdom'
/* re-exports */
export { ContextCallback }
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

export abstract class Context extends AbstractContext {
  tokenize (node: Node): Token[] {
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
        const img = node as HTMLLinkElement
        return [{
          type: 'image',
          text: img.textContent || img.href,
          url: img.href
        }]
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
        let tokens: Token[] = []
        for (const cnode of node.childNodes) {
          tokens = tokens.concat(this.tokenize(cnode))
        }
        tokens.push({
          type: 'br'
        })
        return tokens
      }
      default: {
        let tokens: Token[] = []
        for (const cnode of node.childNodes) {
          tokens = tokens.concat(this.tokenize(cnode))
        }
        return tokens
      }
    }
    // return []
  }
}
