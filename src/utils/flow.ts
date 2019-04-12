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
/* code */
export const trim = (text: string | undefined | null): string | undefined => {
  if (!text) {
    return
  }
  text = text.trim()
  if (!text.length) {
    return
  }
  return text
}

export const flow = <T> (value: T) => {
  return {
    then <O> (fn: (input: NonNullable<T>) => O) {
      if (value) {
        return flow(fn(value as NonNullable<T>))
      } else {
        return flow<O>(undefined as unknown as O)
      }
    },
    value
  }
}
