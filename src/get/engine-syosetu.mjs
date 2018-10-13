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
import cookie from 'cookie'
import mime from 'mime-types'
import { JSDOM } from 'jsdom'
import crypto from 'crypto'
import * as base from './base'
/* -imports */

const got = (url, config = {}) => {
  config.headers = Object.assign({}, config.headers)
  if (/^novel18./.test(url.hostname)) {
    config.headers.cookie = cookie.serialize('over18', 'yes')
  }
  return gotBase(url, config)
}

const hash = (buffer) => {
  const integrity = crypto.createHash('sha256')
    .update(buffer, 'utf8')
    .digest('base64')
  return integrity
}

export class Chapter extends base.Chapter {
  async update () {
    const { props } = this
    delete props.files
    /* prioritize props.doc */
    if (props.buffer && !props.doc) {
      props.files = [
        new base.FileInfo({
          chapter: this,
          fname: this.getName(`${props.title}.txt`),
          integity: undefined,
          buffer: props.buffer
        })
      ]
      return
    }
    let doc = props.doc
    if (!doc) {
      if (!props.sourceURL) {
        return
      }
      doc = await (async () => {
        let { window: { document: doc } } =
        new JSDOM((await got(props.sourceURL)).body, { url: props.sourceURL })
        return doc
      })()
    }
    let files = []
    let imgs = []
    for (const img of doc.querySelectorAll('#novel_color img')) {
      let node = doc.createTextNode(`![](${img.src})`)
      img.parentNode.replaceChild(node, img)
      imgs.push(img.src)
    }
    {
      const buffer = await props.buffer
      let text = buffer ? (
        typeof buffer === 'function' ? await buffer() : buffer.toString()
      ) : ''
      const selectors = [
        '.novel_subtitle',
        '#novel_p',
        '#novel_honbun',
        '#novel_a'
      ]
      for (const sel of selectors) {
        for (const node of doc.querySelectorAll(sel)) {
          text += node.textContent + '\n\n-----\n\n'
        }
      }
      files.push(new base.FileInfo({
        chapter: this,
        fname: this.getName(`${props.title}.txt`),
        integity: undefined,
        buffer: text
      }))
    } /* -text */
    {
      let promises = imgs.map(async (url, index) => {
        let { body: content, headers } = await got(url, { encoding: null })
        let fname = `${
          this.prefix
        } image ${
          String(index + 1).padStart(2, '0')
        }.${
          mime.extension(headers['content-type']) || 'jpg'
        }`
        return {
          chapter: this,
          fname,
          integrity: url,
          buffer: content
        }
      })
      imgs = await Promise.all(promises)
      for (const info of imgs) {
        files.push(new base.FileInfo(info))
      }
    } /* -images */
    props.files = files
  }
}

export class Volume extends base.Volume {
}

export class Series extends base.Series {
  constructor (props, ...argv) {
    super(props, ...argv)
    if (!Series.test(this.sourceURL)) {
      throw new Error('Invalid URL')
    }
  }
  static test (url) {
    return /^((http|https):\/\/|)(ncode|novel18).syosetu.com\/[^/]+\/?$/.test(url)
  }
  get Chapter () { return Chapter }
  get Volume () { return Volume }

  async fetch () {
    const url = this.sourceURL
    let { window: { document: doc } } = new JSDOM((await got(url)).body, { url: url })
    let volumes = []
    let chapters = []
    let description = ''
    {
      const title = doc.querySelector('.novel_title')
        .textContent.trim()
      const author = doc.querySelector('.novel_writername')
        .textContent.trim().substr('作者：'.length)
      description = `# ${title}\nAuthor: ${author}\n\n`
      let singular = false
      {
        let dnode = doc.querySelector('#novel_ex')
        if (dnode != null) {
          description += dnode.textContent
        } else {
          singular = true
        }
        description += '\n\n-----\n\n'
      }
      chapters.push({
        title: 'Description',
        integrity: Date.now(),
        buffer: () => description,
        doc: singular ? doc : undefined
      })
    } /* -description */
    let volumeIndex = -1
    let indexBox = doc.querySelector('.index_box')
    if (indexBox == null) {
      return this.setProps({
        chapters
      })
    }
    let chaptersAsync = []
    for (const node of indexBox.children) {
      if (node.classList.contains('chapter_title')) {
        let title = node.textContent.trim()
        volumes.push({
          title
        })
        description += `\n## ${title}\n`
        ++volumeIndex
      } else if (node.classList.contains('novel_sublist2')) {
        let volIndex = Number(volumeIndex)
        chaptersAsync.push((async () => {
          let { textContent: title, href: link } = (() => {
            let anode = node.firstElementChild.firstElementChild
            if (anode.nodeName.toLowerCase() !== 'a') {
              anode = node.querySelector('a')
            }
            return anode
          })()
          title = title.trim()
          description += `${
            String(chaptersAsync.length + 1).padStart(3, '0')
          } ${title}\n`
          if (link.startsWith('//')) {
            link = url.protocol + link
          } else if (link.startsWith('/')) {
            link = new URL(link, url.origin)
          }
          return {
            volume: volIndex,
            sourceURL: link,
            title,
            integrity: (() => {
              let date = (() => {
                let date = node.lastElementChild
                if (date.classList.contains('long_update')) {
                  return date
                } else {
                  return node.querySelector('.long_update')
                }
              })()
              let span = date.lastElementChild
              if (span) {
                return span.title.trim()
              } else {
                return date.innerHTML.trim()
              }
            })()
          }
        })())
      } else {
        /* unexpected node */
      }
    }
    chapters[0].integrity = hash(description)
    chapters = chapters.concat(await Promise.all(chaptersAsync))
    await this.setProps({
      volumes,
      chapters
    })
  }
}

export default Series
