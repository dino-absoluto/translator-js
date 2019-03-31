/**
 * @file index.ts
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
import * as gotBase from 'got'
import * as cookie from 'cookie'
import { JSDOM } from 'jsdom'
/* -imports */

const got = (
  href: string,
  config: { headers?: { cookie?: string} } = {}) => {
  let url = new URL(href)
  config.headers = Object.assign({}, config.headers)
  if (/^(novel18|noc|mnlt|mid)./.test(url.hostname)) {
    config.headers.cookie = cookie.serialize('over18', 'yes')
  }
  return gotBase(url, config)
}

const getURL = (page: number, subdomain = 'yomou') => {
  if (subdomain !== 'yomou') {
    return `https://${subdomain}.syosetu.com/search/search/search.php?` +
      `&order_former=search&order=monthlypoint&all4=1&all3=1&all2=1&p=${page}`
  }
  return 'https://yomou.syosetu.com/search.php?' +
  `&order_former=search&order=monthlypoint&notnizi=1&p=${page}`
}

interface KeywordsMap {
  [id: string]: number;
}

const fetch = async (href: string, map: KeywordsMap = {}) => {
  const body = (await got(href)).body
  const procLink = (links: NodeListOf<Node>) => {
    for (const node of links) {
      const text = (node.textContent || '').trim()
      map[text] = (map[text] || 0) + 1
    }
  }
  let { window: { document: doc } } = new JSDOM(body, { url: href })
  if (href.indexOf('https://mid.') >= 0) {
    procLink(doc.querySelectorAll('.keyword a'))
  } else {
    for (const ex of doc.querySelectorAll('.searchkekka_box .ex')) {
      let node = ex.parentNode && ex.parentNode.parentNode
      if (node) {
        procLink(node.querySelectorAll('a'))
      }
    }
  }
  return map
}

const sort = (data: KeywordsMap) => {
  const array = [...Object.entries(data)]
  array.sort((a, b) => {
    let A = a[1]
    let B = b[1]
    if (A > B) {
      return -1
    }
    if (A < B) {
      return 1
    }
    return 0
  })
  const obj: KeywordsMap = {}
  for (const [key, value] of array) {
    obj[key] = value
  }
  return obj
}

const defaultBatches : [string, number][] = [
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
