/**
 * @file syosetu.js
 * @license
 * This file is part of novel-js.
 *
 * novel-js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * novel-js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with novel-js.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
/* Imports */
const got = require('got')
const cookie = require('cookie')
const crypto = require('crypto')
const chalk = require('chalk')
const mime = require('mime-types')
const { JSDOM } = require('jsdom')
const { URL } = require('url')

const _processChapter = async (url, config, doc) => {
  if (doc == null) {
    let { window: { document: ndoc } } =
      new JSDOM((await got(url, config)).body, { url: url })
    doc = ndoc
  }
  let imgs = []
  for (const img of doc.querySelectorAll('#novel_color img')) {
    let node = doc.createTextNode(`![](${img.src})`)
    img.parentNode.replaceChild(node, img)
    imgs.push(img.src)
  }
  let text = ''
  {
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
  }
  imgs = imgs.map(async url => {
    let { body: content, headers } = await got(url, { encoding: null })
    let name = `image.${mime.extension(headers['content-type']) || 'jpg'}`
    return {
      url,
      content,
      name
    }
  })
  const extras = []
  for (const item of imgs) {
    extras.push(await item)
  }
  return {
    content: text,
    extras
  }
}

module.exports = class Syosetu {
  static test (url) {
    return /^((http|https):\/\/|)(ncode|novel18).syosetu.com\/[^/]+\/?$/.test(url)
  }

  static async run (updater) {
    const url = new URL(updater.url)
    const config = {
      headers: {}
    }
    if (/^novel18./.test(url.hostname)) {
      config.headers.cookie = cookie.serialize('over18', 'yes')
    }
    let { window: { document: doc } } = new JSDOM((await got(url, config)).body, { url: url })
    const title = doc.querySelector('.novel_title').textContent.trim()
    const author = doc.querySelector('.novel_writername').textContent.trim().substr('作者：'.length)
    /* Update Description */
    {
      let extras
      let description = `# ${title}\nAuthor: ${author}\n\n`
      let descnode = doc.querySelector('#novel_ex')
      if (descnode != null) {
        description += descnode.textContent
      } else {
        const data = await _processChapter(null, null, doc)
        description += data.content
        extras = data.extras
      }
      const hash = crypto.createHash('sha256')
        .update(description)
        .digest('base64')
      updater.addChapter({
        volumeIndex: 0,
        title: 'Index',
        sign: hash,
        get content () {
          return description
        },
        extras
      })
    }
    let volumeIndex = -1
    let indexBox = doc.querySelector('.index_box')
    if (indexBox == null) {
      return
    }
    let chaptersAsync = []
    for (const node of indexBox.children) {
      if (node.classList.contains('chapter_title')) {
        updater.addVolume(node.textContent.trim())
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
            volumeIndex: volIndex,
            title: title.trim(),
            sign: (() => {
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
            })(),
            async fetch () {
              const data = await _processChapter(link, config)
              delete this.fetch
              Object.assign(this, data)
              return this
            }
          }
        })())
      } else {
        console.warn(chalk.yellow(`Unexpected node .${
          node.classList.join('.')} ${node.textContent}`))
      }
    }
    const chapters = await Promise.all(chaptersAsync)
    for (const ch of chapters) {
      updater.addChapter(ch)
    }
  }
}
