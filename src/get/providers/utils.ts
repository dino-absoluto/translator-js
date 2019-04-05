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
import got from '../../utils/syosetu-got'
import { flow, trim } from '../../utils/flow'
import { JSDOM } from 'jsdom'
/* code */

export const getAsDOM = async (url: string) => {
  let { window: { document: doc } } =
    new JSDOM((await got(url)).body, { url })
  return doc
}

export const download = async (url: string) => {
  const res = (await got(url, {
    encoding: null
  }))
  const buf = res.body
  const disp = res.headers['content-disposition']
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
  return {
    buf
  }
}
