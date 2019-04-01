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
import * as keywords from './keywords.json'
import { mapKeyword } from '../wordmapper'

test('empty test', () => {
  let mapped = 0
  let sum = 0
  for (const [key, count] of Object.entries(keywords)) {
    sum += count
    if (key !== mapKeyword(key)) {
      mapped += count
    }
  }
  expect(mapped).toBeGreaterThan(0)
  expect(sum).toBeGreaterThan(0)
  console.log(`Coverage: ${Math.round(mapped / sum * 10000)/100}% of ${sum}`)
})
