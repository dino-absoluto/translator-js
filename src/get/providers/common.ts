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
