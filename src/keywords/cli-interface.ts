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
import * as c from 'ansi-colors'
import * as path from 'path'
import * as pfs from '../utils/pfs'
/* -imports */

interface CommandOptions {
  output?: string
  multiplier?: number
}

const cmdKeywords = async (options: CommandOptions) => {
  const output = path.join(options.output || './download/', 'keywords.json')
  const sum = (await import('.')).default
  const MULTIPLIER = Math.max(1, options.multiplier || 0)
  pfs.writeFile(output, JSON.stringify(await sum(MULTIPLIER), null, 1))
}

console.log(c.blueBright('Generating keywords!'))

cmdKeywords({ multiplier: 50 }).catch(err => {
  console.error(err)
})
