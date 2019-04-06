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
import chalk from 'chalk'
import Progress = require('progress')
import cliTruncate = require('cli-truncate')

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
  outputDir?: string
  overwrite?: boolean
}

export const handler: Cmd.Handler = async (argv: CmdOptions) => {
  if (!argv.sources) {
    throw new Error('no sources specified')
  }
  // console.log(argv)
  const outputDir = argv.outputDir || path.resolve('download')
  const { Series } = await import('.')
  const names = argv.name || []
  const novels = argv.sources.map(src => {
    if (src.type === 'url') {
      return new Series({
        overwrite: argv.overwrite,
        outputDir,
        sourceURL: src.url.toString(),
        basename: names.shift()
      })
    } else {
      return new Series({
        overwrite: argv.overwrite,
        outputDir: path.dirname(src.fpath),
        basename: path.basename(src.fpath)
      })
    }
  })
  for (const novel of novels) {
    const columns = process.stdout.columns || 40
    let prg: Progress | undefined
    await novel.ready
    await novel.updateIndex((novel, _c, total) => {
      if (prg) {
        prg.tick()
      } else {
        const limit = Math.floor(columns / 2) - total.toString().length * 2
        const name = cliTruncate(`${novel.data.name || 'unknown'}`, limit)
        prg = new Progress(
            chalk`:bar {gray [:current/:total]} ${name}`, {
              complete: '█',
              incomplete: '░',
              // incomplete: chalk.gray('░'),
              width: Math.floor(columns / 3),
              clear: false,
              total
            })
      }
    })
  }
}

export const command: Cmd.Command = 'get [<sources>..]'
export const describe: Cmd.Describe = 'Download novel from sources'
export const builder: Cmd.Builder = yargs =>
  yargs.strict()
  .usage('$0 get [--output-dir=<path>] [options] [<URL> | <path>..]')
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
  .option('output-dir', {
    type: 'string',
    default: 'download',
    requiresArg: true,
    coerce: values => {
      if (Array.isArray(values)) {
        throw new Error('--output-dir was used twice')
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
  .option('overwrite', {
    type: 'boolean',
    default: false,
    desc: 'Force overwriting exist data'
  })
