/**
 * @file CLI interface
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

export namespace Cmd {
  export type Command = string | string[]
  export type Aliases = string | string[]
  export type Describe = string | false
  export type Builder = (yargs: Parser) => Parser
  export type Handler = (argv: SharedOptions) => void
}
