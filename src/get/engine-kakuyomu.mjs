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
import * as base from './base'
import { JSDOM } from 'jsdom'
import got from 'got'
import hash from './utils/hash'
import getExternal from './utils/get-external'
/* -imports */

export class Chapter extends base.Chapter {
  async update () {
    const { props } = this
    const oldFiles = props.files
    delete props.files
    /* prioritize props.doc */
    if (props.buffer && !props.doc) {
      props.files = [
        {
          fname: this.getName(`${props.title}.txt`),
          integity: undefined,
          buffer: props.buffer
        }
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
    let rootNode = doc.getElementById('contentMain-inner')
    for (const img of rootNode.getElementsByTagName('img')) {
      let node = doc.createTextNode(`![](${img.src})`)
      img.parentNode.replaceChild(node, img)
      imgs.push(img.src)
    }
    props.files = files
    {
      const buffer = await props.buffer
      let text = buffer ? (
        typeof buffer === 'function' ? await buffer() : buffer.toString()
      ) : ''
      const selectors = [
        'widget-episodeTitle',
        'widget-episode'
      ]
      for (const sel of selectors) {
        for (const node of rootNode.getElementsByClassName(sel)) {
          text += node.textContent + '\n\n-----\n\n'
        }
      }
      files.push({
        fname: this.getName(`${props.title}.txt`),
        integity: undefined,
        buffer: text
      })
    }
    await getExternal(oldFiles, files, imgs)
  }
}

export class Volume extends base.Volume {
}

export class Series extends base.Series {
  static test (url) {
    return /^((http|https):\/\/|)kakuyomu.jp\/works\/[^/]+\/?$/.test(url)
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
      let text = ''
      text += doc.getElementById('workTitle').textContent + '\n'
      text += `Author: ${
        doc.getElementById('workAuthor-activityName').textContent}\n`
      text += `\n${
        doc.getElementById('introduction').textContent}\n`
      description += text
      text = undefined
      chapters.push({
        title: 'Description',
        integrity: Date.now(),
        buffer: () => description
      })
    }
    let volumeIndex = -1
    for (const toc of doc.getElementsByClassName('widget-toc-items')) {
      for (const ep of toc.children) {
        if (ep.classList.contains('widget-toc-chapter')) {
          let title = ep.textContent.trim()
          volumes.push({
            title
          })
          description += `\n## ${title}\n`
          ++volumeIndex
        } else {
          let a = ep.getElementsByClassName('widget-toc-episode-episodeTitle')[0]
          let sourceURL = a.href
          let title = a.getElementsByClassName('widget-toc-episode-titleLabel')[0].textContent
          let integrity = a.getElementsByClassName('widget-toc-episode-datePublished')[0]
            .getAttribute('datetime')
          description += `${
            String(chapters.length).padStart(3, '0')
          } ${title}\n`
          chapters.push({
            volume: volumeIndex,
            sourceURL,
            title,
            integrity
          })
        }
      }
    }
    chapters[0].integrity = hash(description)
    return this.patch({
      volumes,
      chapters
    })
  }
}

export default Series
