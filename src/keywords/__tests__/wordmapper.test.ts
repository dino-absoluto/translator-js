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
import { mapKeyword } from '../wordmapper'
import { WordMap } from '../words'
import * as path from 'path'
import * as pfs from '../../utils/pfs'
import chalk from 'chalk'

interface TestOptions {
  lax?: boolean
  outputFile: string
}

const testKeywords = async (options: TestOptions): Promise<void> => {
  const keywords = await import('./keywords.json')
  const outMap: { [id: string]: WordMap } = {
    yomou: {},
    noc: {},
    mnlt: {},
    mid: {}
  }
  const coverage = []
  for (const [subdomain, map] of Object.entries(keywords)) {
    let mapped = 0
    let sum = 0
    const subMap = outMap[subdomain]
    for (const [key, count] of Object.entries(map)) {
      sum += count
      const mappedKey = mapKeyword(key, options.lax)
      subMap[key] = mappedKey
      if (key !== mappedKey) {
        mapped += count
      }
    }
    expect(mapped).toBeGreaterThan(0)
    expect(sum).toBeGreaterThan(0)
    coverage.push([ subdomain,
      chalk`{green ${
        (Math.round(mapped / sum * 1000) / 10 + '%').padEnd(5, ' ')}} {grey of} {yellow ${
        sum.toString()}}`
    ])
  }
  console.log(coverage.map(
    ([subdomain, msg]) => chalk`{blue [${subdomain.padEnd(5, ' ')}]} ${msg}`).join('\n'))
  await pfs.writeFile(path.join(__dirname, options.outputFile),
    JSON.stringify(outMap, null, 1)
  )
}

test('coverage', () => testKeywords({
  outputFile: 'keywords-mapped.json'
}))

test('coverage relaxed', () => testKeywords({
  lax: true,
  outputFile: 'keywords-mapped-relaxed.json'
}))
