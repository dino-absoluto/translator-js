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

export interface Formatter {
  requestFile: (name: string) => string
  parseNode: (node: Node) => string
}

export interface Content {
  content: (fmt: Formatter) => string
  resources: {
    name: string
    data: Buffer
  }[]
}

export interface Chapter {
  group: string
  name: string
  updateId?: string
  content?: Content
  fetch: () => Promise<void>
}

export type Index = Chapter[]

export interface Novel {
  readonly id: string
  name?: string
  author?: string
  description?: string
  keywords?: string[]
  status?: {
    completed: boolean
    size: number
  }
  fetch?: () => Promise<void>
  fetchIndex?: () => Promise<Index>
}

export interface Provider {
  acceptDomains: string[]
  fromURL: (href: URL) => Novel | null
}
