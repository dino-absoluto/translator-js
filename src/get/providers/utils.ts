/**
 * @file Syosetu provider
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
import { flow, trim } from '../../utils/flow'
import { JSDOM } from 'jsdom'
import * as mime from 'mime'
import fetch from 'node-fetch'

/* code */
export const fetchDOM = async (url: string) => {
  let { window: { document: doc } } =
    new JSDOM(await (await fetch(url)).text(), { url })
  return doc
}

export const fetchFile = async (url: string) => {
  const res = await fetch(url)
  const buf = await res.buffer()
  {
    const disp = res.headers.get('content-disposition')
    if (disp) {
      const name = trim(flow(disp.match(/; filename="[^"]+"/))
        .then(a => a[1]).get())
      if (name) {
        return {
          buf,
          name
        }
      }
    }
  }
  {
    const type = res.headers.get('content-type')
    if (type) {
      const ext = flow(trim(type.split(';')[0]))
        .then(mime.getExtension).get()
      if (ext) {
        return {
          buf,
          name: `untitled.${ext}`
        }
      }
    }
  }
  return {
    buf,
    name: 'untitled'
  }
}
