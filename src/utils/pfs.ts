/**
 * @file Promised fs
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
import * as fs from 'fs'
/* code */

const wrap = (fn: any): any => {
  return (...argv: any[]) => {
    return new Promise((resolve, reject) => {
      fn(...argv, (err: Error, data: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
}

export const readFile:
  typeof fs.promises.readFile = wrap(fs.readFile)
export const writeFile:
  typeof fs.promises.writeFile = wrap(fs.writeFile)
export const rename:
  typeof fs.promises.rename = wrap(fs.rename)
export const unlink:
  typeof fs.promises.unlink = wrap(fs.unlink)
export const rmdir:
  typeof fs.promises.rmdir = wrap(fs.rmdir)
