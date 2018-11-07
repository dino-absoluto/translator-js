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
import gotBase from 'got'
import mime from 'mime-types'
import { JSDOM } from 'jsdom'
/* -imports */

const replaceImages = (doc, selector) => {
  let imgs = []
  for (const img of doc.querySelectorAll(selector)) {
    let node = doc.createTextNode(`![](${img.src})`)
    img.parentNode.replaceChild(node, img)
    imgs.push(img.src)
  }
  return imgs
}

const getExternal = async (options = {}) => {
  const { prefix, oldFiles, files, urls } = options
  const offset = files.length
  const got = options.got || gotBase
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

export default async (options, handleDoc) => {
  const got = options.got || gotBase
  const oldFiles = options.files
  /* prioritize props.doc */
  if (options.buffer && !options.doc) {
    return [
      {
        fname: `${options.prefix} ${options.title}.txt`,
        integity: undefined,
        buffer: options.buffer
      }
    ]
  }
  let doc = options.doc
  if (!doc) {
    if (!options.sourceURL) {
      return
    }
    doc = await (async () => {
      let { window: { document: doc } } =
      new JSDOM((await got(options.sourceURL)).body, { url: options.sourceURL })
      return doc
    })()
  }
  let [ files, urls ] = await handleDoc(doc, {
    getImages: replaceImages.bind(null, doc)
  })
  await getExternal({
    prefix: options.prefix,
    oldFiles,
    files,
    urls,
    got
  })
  return files
}
