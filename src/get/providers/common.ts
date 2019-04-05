/**
 * @file Common code
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

export type ContextCallback = (name: string) => Buffer | string[]
export abstract class Context {
  abstract requestFile (
    name: string,
    fn: ContextCallback): void

  parseNode (node: Node): string {
    return node.textContent || ''
  }
}

export type Content = (fmt: Context) => void

export interface ChapterData {
  group?: string
  name: string
  updateId?: string
  content?: Content
}

export interface Chapter extends ChapterData {
  fetch (): Promise<void>
}

export interface NovelData {
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
}

export interface Novel extends NovelData {
  fetch (): Promise<void>
  fetchIndex (): Promise<Chapter[]>
}

export interface Provider {
  readonly acceptDomains: string[]
  fromURL (href: URL): Novel | undefined
}
