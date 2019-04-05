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
import { Context as AbstractContext } from './common'
import { flow, trim } from '../../utils/flow'
/* code */

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

export type Token = TokenString | TokenRuby | TokenImage | TokenLink

export abstract class Context extends AbstractContext {
  tokenize (node: Element): Token[] {
    if (node.nodeType === Node.TEXT_NODE) {
      return [{
        type: 'text',
        text: node.textContent || ''
      }]
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
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
      default: {
        let tokens: Token[] = []
        for (const cnode of node.children) {
          tokens = tokens.concat(this.tokenize(cnode))
        }
        return tokens
      }
    }
    // return []
  }
}
