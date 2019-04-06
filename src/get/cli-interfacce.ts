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
import { CommandStructure, SharedArgv } from '../cli/shared'
/* code */

interface CmdOptions extends SharedArgv {
  name?: string
}

const handler = (argv: CmdOptions) => {
  console.log(argv)
}

const info: CommandStructure = {
  name: 'get [<sources>..]',
  description: 'Download novel from sources',
  init: yargs =>
    yargs.usage('$0 get [--target-dir=<path>] [options] [<URL> | <path>..]')
    .option('name', {
      type: 'string',
      desc: 'Set containing folder name'
    })
    ,
  handler
}

export default info
