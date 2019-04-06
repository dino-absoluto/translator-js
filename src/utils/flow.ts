/**
 * @file Syosetu, override default options
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
