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
import cookie from 'cookie'
import JSDOM from 'jsdom'
import crypto from 'crypto'
import * as base from './base'
/* -imports */

export class Chapter extends base.Chapter {
  update () {
    const { props } = this
    const files = [
      new base.FileInfo({
        chapter: this,
        fname: this.getName(`${props.title}.txt`),
        integrity: undefined,
        buffer: async () => `${props.title}\n---\n\nHello World!\n`
      })
    ]
    props.files = files
  }
}

export class Volume extends base.Volume {
}

export class Series extends base.Series {
  constructor (props) {
    super(props)
    {
      const regexp = /^((http|https):\/\/|)(ncode|novel18).syosetu.com\/[^/]+\/?$/
      if (!regexp.test(this.sourceURL)) {
        throw new Error('Invalid URL')
      }
    }
  }
  get Chapter () { return Chapter }
  get Volume () { return Volume }

  async got (url, config = {}) {
    config.headers = {}
    if (/^novel18./.test(url.hostname)) {
      config.headers.cookie = cookie.serialize('over18', 'yes')
    }
    return got(url, config)
  }

  async refresh () {
    const url = this.sourceURL
    let { window: { document: doc } } = new JSDOM((await this.got(url)).body, { url: url })
    let volumes = []
    let chapters = []
    {
      const title = doc.querySelector('.novel_title')
        .textContent.trim()
      const author = doc.querySelector('.novel_writername')
        .textContent.trim().substr('作者：'.length)
      let description = `# ${title}\nAuthor: ${author}\n\n`
      let descnode = doc.querySelector('#novel_ex')
      if (descnode != null) {
        description += descnode.textContent
      }
      const integrity = crypto.createHash('sha256')
        .update(description, 'utf8')
        .digest('base64')
      chapters.push({
        title: 'Description',
        integrity,
        buffer: description
      })
    } /* -description */
    let volumeIndex = -1
    let indexBox = doc.querySelector('.index_box')
    if (indexBox == null) {
      return
    }
    let chaptersAsync = []
    for (const node of indexBox.children) {
      if (node.classList.contains('chapter_title')) {
        volumes.push({
          title: node.textContent.trim()
        })
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
          if (link.startsWith('//')) {
            link = url.protocol + link
          } else if (link.startsWith('/')) {
            link = new URL(link, url.origin)
          }
          return {
            volume: volIndex,
            sourceURL: link,
            title: title.trim(),
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
    chapters = await Promise.all(chaptersAsync)
    await this.setProps({
      volumes,
      chapters
    })
  }
}
