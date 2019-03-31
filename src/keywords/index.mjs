/**
 * @file index.js
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
/* config */
import gotBase from 'got'
import cookie from 'cookie'
import { JSDOM } from 'jsdom'
/* -imports */

const got = (url, config = {}) => {
  url = new URL(url)
  config.headers = Object.assign({}, config.headers)
  if (/^(novel18|noc|mnlt|mid)./.test(url.hostname)) {
    config.headers.cookie = cookie.serialize('over18', 'yes')
  }
  return gotBase(url, config)
}

const getURL = (page, subdomain = 'yomou') => {
  if (subdomain !== 'yomou') {
    return `https://${subdomain}.syosetu.com/search/search/search.php?` +
      `&order_former=search&order=monthlypoint&all4=1&all3=1&all2=1&p=${page}`
  }
  return 'https://yomou.syosetu.com/search.php?' +
  `&order_former=search&order=monthlypoint&notnizi=1&p=${page}`
}

const fetch = async (url, map = {}) => {
  const body = (await got(url)).body
  const procLink = links => {
    for (const node of links) {
      const text = node.textContent.trim()
      map[text] = (map[text] || 0) + 1
    }
  }
  let { window: { document: doc } } = new JSDOM(body, { url: url })
  if (url.indexOf('https://mid.') >= 0) {
    procLink(doc.querySelectorAll('.keyword a'))
  } else {
    for (const ex of doc.querySelectorAll('.searchkekka_box .ex')) {
      procLink(ex.parentNode.parentNode.getElementsByTagName('a'))
    }
  }
  return map
}

const sort = data => {
  const array = [...Object.entries(data)]
  array.sort((a, b) => {
    a = a[1]
    b = b[1]
    if (a > b) {
      return -1
    }
    if (a < b) {
      return 1
    }
    return 0
  })
  const obj = {}
  for (const [key, value] of array) {
    obj[key] = value
  }
  return obj
}

const defaultBatches = [
  [ 'yomou', 4 ],
  [ 'noc', 2 ],
  [ 'mnlt', 1 ],
  [ 'mid', 1 ]
]

const generate = async (batches = defaultBatches) => {
  const map = {}
  for (const [subdomain, pages] of batches) {
    for (let i = 1; i <= pages; ++i) {
      console.log(`Fetching from ${subdomain}/page ${i}`)
      const url = getURL(i, subdomain)
      await fetch(url, map)
    }
  }
  return sort(map)
}

export default generate
