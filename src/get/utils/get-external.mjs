/**
 * @file Get module
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
import got from 'got'
import mime from 'mime-types'
/* -imports */

const getExternal = async ({
  prefix, oldFiles, files, urls
}) => {
  const offset = files.length
  let promises = urls.map(async (url, index) => {
    const get = async () => {
      let { body: content, headers } = await got(url, { encoding: null })
      let fname = `${
        prefix
      } image ${
        String(index + 1).padStart(2, '0')
      }.${
        mime.extension(headers['content-type']) || 'jpg'
      }`
      return { content, fname }
    }
    let old = oldFiles && oldFiles[index + offset]
    if (old && old.fname && old.integrity && old.integrity === url) {
      return {
        fname: old.fname,
        integrity: url,
        buffer: async () => {
          return (await get()).content
        }
      }
    }
    let { fname, content } = await get()
    return {
      fname,
      integrity: url,
      buffer: content
    }
  })
  let datas = await Promise.all(promises)
  for (const info of datas) {
    files.push(info)
  }
}

export default getExternal
