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
import { SharedOptions, Cmd } from '../cli/shared'
import * as path from 'path'

/* code */
const CWD = path.resolve('.')

type ArgString = string | string[]

interface SourceURL {
  type: 'url'
  url: URL
}

interface SourceFolder {
  type: 'folder'
  fpath: string
}

type Source = SourceURL | SourceFolder

interface CmdOptions extends SharedOptions {
  sources?: Source[]
  name?: string[]
  targetDir?: string
}

export const handler: Cmd.Handler = (argv: CmdOptions) => {
  if (!argv.sources) {
    throw new Error('no sources specified')
  }
  const names = argv.name || []
  for (const src of argv.sources) {
    // if (src.type === 'url') {
    // }
  }
  console.log(argv)
}

export const command: Cmd.Command = 'get [<sources>..]'
export const describe: Cmd.Describe = 'Download novel from sources'
export const builder: Cmd.Builder = yargs =>
  yargs.strict()
  .usage('$0 get [--target-dir=<path>] [options] [<URL> | <path>..]')
  .coerce('sources', (values: ArgString): Source[] => {
    if (!Array.isArray(values)) {
      values = [ values ]
    }
    return values.map(a => {
      try {
        return {
          type: 'url',
          url: new URL(a)
        } as SourceURL
      } catch {
        return {
          type: 'folder',
          fpath: path.relative(CWD, path.resolve(a))
        } as SourceFolder
      }
    })
  })
  .option('target-dir', {
    type: 'string',
    default: 'download',
    requiresArg: true,
    coerce: values => {
      if (Array.isArray(values)) {
        throw new Error('--target-dir was used twice')
      }
      return path.normalize(values)
    },
    desc: 'Output directory'
  })
  .option('name', {
    type: 'string',
    requiresArg: true,
    coerce: values => {
      if (!Array.isArray(values)) {
        return [ values ]
      }
      return values
    },
    desc: 'Hint to name new folder'
  })
