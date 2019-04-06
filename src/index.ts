/**
 * @file index.mjs
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
import chalk from 'chalk'
import * as path from 'path'
import * as pfs from './utils/pfs'
/* -imports */

interface CommandOptions {
  output?: string
  multiplier?: number
}

const cmdKeywords = async (options: CommandOptions) => {
  const output = path.join(options.output || './download/', 'keywords.json')
  const sum = (await import('./keywords')).default
  const MULTIPLIER = Math.max(1, options.multiplier || 0)
  pfs.writeFile(output, JSON.stringify(await sum(MULTIPLIER), null, 1))
}

console.log(chalk`{blueBright Generating keywords!}`)

cmdKeywords({ multiplier: 50 }).catch(err => {
  console.error(err)
})
