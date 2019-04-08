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
import { flow, trim } from '../../utils/flow'
import { JSDOM } from 'jsdom'
import * as mime from 'mime'
import fetch from '../../utils/syosetu-fetch'

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
        .then(a => a[1]).value)
      if (name) {
        return {
          url,
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
        .then(mime.getExtension).value
      if (ext) {
        return {
          url,
          buf,
          name: `untitled.${ext}`
        }
      }
    }
  }
  return {
    url,
    buf,
    name: 'untitled'
  }
}
