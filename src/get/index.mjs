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
import { Series } from './base'
/* -imports */

const engines = Promise.all([
  import('./engine-syosetu'),
  import('./engine-kakuyomu')
].map(engine => engine.then(e => e.default)))

export default async (options) => {
  const meta = Series.parseMeta(options)
  const engine = (async () => {
    for (const Engine of await engines) {
      if (Engine.test(meta.sourceURL)) {
        return new Engine(meta, true)
      }
    }
  })()
  if (!engine) {
    throw new Error('Failed to find a matching engine')
  }
  return engine
}
