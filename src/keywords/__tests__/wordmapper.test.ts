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
/* imports */
import { mapKeyword } from '../wordmapper'
import { WordMap } from '../words'
import * as path from 'path'
import * as pfs from '../../utils/pfs'

interface TestOptions {
  lax?: boolean,
  outputFile: string
}

const testKeywords = async (options: TestOptions) => {
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
      `${Math.round(mapped / sum * 10000) / 100}% of ${sum}`
    ])
  }
  console.log(coverage.map(
    ([subdomain, msg]) => `[${subdomain}]: ${msg}`).join('\n'))
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
