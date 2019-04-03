/**
 * @file provider.ts
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
/* code */

export abstract class Formatter {
  requestFile (_name: string): string {
    throw new Error('Unimplemented requestFile()')
  }
  parseNode (node: Node): string {
    return node.textContent || ''
  }
}

export interface Content {
  content: (fmt: Formatter) => string[]
  resources: {
    name: string
    data: Buffer
  }[]
}

export interface Chapter {
  group?: string
  name: string
  updateId?: string
  content?: Content
  fetch (): Promise<void>
}

export type Index = Chapter[]

export interface Novel {
  readonly id: string
  name?: string
  author?: string
  description?: string
  keywords?: string[]
  genre?: string
  status?: {
    completed: boolean
    size: number
  }
  fetch (): Promise<void>
  fetchIndex (): Promise<Index>
}

export interface Provider {
  readonly acceptDomains: string[]
  fromURL (href: URL): Novel | undefined
}
