/**
 * @author Dino <dinoabsoluto+dev@gmail.com>
 * @license
 * Translator-js - Scripts to facilitate Japanese webnovel
 * Copyright (C) 2019 Dino <dinoabsoluto+dev@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */
/* imports */
import { Context } from './context'
/* code */

export interface Token {
  type: string
}

export type RenderFn = (ctx: Context) => void

export interface ChapterData {
  group?: string
  name: string
  updateId?: string
  content?: RenderFn
}

export interface Chapter extends ChapterData {
  fetch (): Promise<void>
}

export interface NovelData {
  readonly id: string
  readonly url?: string
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
