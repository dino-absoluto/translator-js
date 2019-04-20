/**
 * @author Dino <dinoabsoluto+dev@gmail.com>
 * @license
 * Copyright 2019 Dino <dinoabsoluto+dev@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/* imports */
import { JSDOM } from 'jsdom'
import fetch from '../utils/syosetu-fetch'
import { clearLine, cursorTo } from 'readline'
import * as c from 'kleur'

const getURL = (page: number, subdomain = 'yomou') => {
  if (subdomain !== 'yomou') {
    return `https://${subdomain}.syosetu.com/search/search/search.php?` +
      `&order_former=search&order=monthlypoint&all4=1&all3=1&all2=1&p=${page}`
  }
  return 'https://yomou.syosetu.com/search.php?' +
  `&order_former=search&order=monthlypoint&notnizi=1&p=${page}`
}

interface KeywordsMap {
  [id: string]: number
}

const get = async (href: string, map: KeywordsMap = {}) => {
  const body = await (await fetch(href)).text()
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

enum SubDomain {
  yomou = 'yomou',
  noc = 'noc',
  mnlt = 'mnlt',
  mid = 'mid'
}

const batches: [SubDomain, number][] = [
  [ SubDomain.yomou, 2 ],
  [ SubDomain.noc, 1 ],
  [ SubDomain.mnlt, 1 ],
  [ SubDomain.mid, 1 ]
]

const generate = async (multiplier = 10) => {
  const { stdout } = process
  const map: { [id: string]: KeywordsMap } = {
    yomou: {},
    noc: {},
    mnlt: {},
    mid: {}
  }
  for (const [subdomain, pages] of batches) {
    const MAX = multiplier * pages
    for (let i = 1; i <= MAX; ++i) {
      clearLine(stdout, 0)
      cursorTo(stdout, 0)
      stdout.write(`Fetching from ${
        c.green(subdomain)}${
        c.gray('/')}${
        c.green(`page-${i.toString()}`)}`
      )
      const url = getURL(i, subdomain)
      await get(url, map[subdomain])
    }
  }
  clearLine(stdout, 0)
  cursorTo(stdout, 0)
  console.log(c.green('Done!'))
  for (const [subdomain, subMap] of Object.entries(map)) {
    map[subdomain] = sort(subMap)
  }
  return map
}

export default generate
