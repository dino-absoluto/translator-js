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
// import * as path from 'path'
import chalk from 'chalk'
/* code */

interface CmdOptions extends SharedArgv {
  name?: string
}

const handler = (argv: CmdOptions) => {
  if (Array.isArray(argv['target-dir'])) {
    throw new Error('--target-dir was used twice')
  }
  // console.log(argv)
}

const info: CommandStructure = {
  name: 'get [<sources>..]',
  description: 'Download novel from sources',
  init: yargs =>
    yargs.strict()
    .usage('$0 get [--target-dir=<path>] [options] [<URL> | <path>..]')
    .option('target-dir', {
      type: 'string',
      default: './download',
      requiresArg: true,
      desc: 'Output directory'
    })
    .option('name', {
      type: 'string',
      requiresArg: true,
      desc: 'Set containing folder name'
    })
    .fail(err => {
      yargs.showHelp()
      console.error(chalk`{red ${err}}`)
      return
    })
    ,
  handler
}

export default info
