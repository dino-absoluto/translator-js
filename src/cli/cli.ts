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
import { parser as yargs } from './shared'
import * as cmdGet from '../get/cli-interface'
import * as c from 'kleur'

try {
  yargs
    .command(cmdGet)
    .help()
    .fail((msg, err): void => {
      yargs.showHelp()
      if (err) {
        console.log(c.red(err.stack || ''))
      } else {
        console.error(c.red(msg))
      }
    })
    .parse()
} catch (err) {
  console.error(c.red((err.stack || '').toString()))
}
