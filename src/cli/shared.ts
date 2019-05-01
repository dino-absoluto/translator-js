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
import yargs = require('yargs')

export const parser = yargs.strict(true)
  .usage('$0 <cmd> [args]')
  .demandCommand(1)
  .group([ 'help', 'version' ], 'Info:')
  .option('pedantic', {
    default: true,
    hidden: true,
    type: 'boolean',
    desc: 'Exit on first error'
  })
export type Parser = typeof parser
export type SharedOptions = typeof parser.argv
// export type CmdCommand = string | string[]
// export type CmdAliases = string | string[]
// export type CmdDescribe = string | false
export type CmdBuilder = (yargs: Parser) => Parser
export type CmdHandler = (argv: SharedOptions) => void
