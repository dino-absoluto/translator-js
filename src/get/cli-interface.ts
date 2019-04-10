/**
 * @author Dino <dinoabsoluto+dev@gmail.com>
 * @license
 * Translator-js - Scripts to facilitate Japanese webnovel
 * Copyright (C) 2019 Dino <dinoabsoluto+dev@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */
/* imports */
import { SharedOptions, Cmd } from '../cli/shared'
import * as path from 'path'
import chalk from 'chalk'
import * as FlexProgress from '@dinoabsoluto/flex-progress-js'
import once = require('lodash/once')
import overArgs = require('lodash/overArgs')

/* code */
const CWD = path.resolve('.')
const MAX_LOG = 20

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
  const checkFs = !!argv.checkFs
  const outputDir = argv.outputDir || path.resolve('download')
  const { Series } = await import('.')
  const names = argv.name || []
  const novels = argv.sources.map(src => {
    if (src.type === 'url') {
      return {
        overwrite: argv.overwrite,
        outputDir,
        sourceURL: src.url.toString(),
        basename: names.shift()
      }
    } else {
      return {
        overwrite: argv.overwrite,
        outputDir: path.dirname(src.fpath),
        basename: path.basename(src.fpath)
      }
    }
  })
  const output = new FlexProgress.Output()
  output.append(
    new FlexProgress.HideCursor()
  , 1
  , new FlexProgress.Spinner({ postProcess: chalk.cyan }))
  process.on('SIGTERM', () => {
    output.clear()
    process.exit(0)
  })
  for (const novelData of novels) {
    const novel = new Series(novelData)
    const group = new FlexProgress.Group()
    const bar = new FlexProgress.Bar({
      width: 20
    , postProcess:
      overArgs((...s: string[]) => s.join(''),
        chalk.green, chalk.yellow, chalk.gray)
    })
    const init = once(() => {
      group.append(
        '⸨', bar, '⸩'
      , 1, new FlexProgress.Text({
        text: path.basename(novel.container.name || 'unknown')
      , flex: {
        shrink: 1,
        grow: 0
      }
      }))
      output.add(group, 0)
    })
    await novel.ready
    const report = await novel.updateIndex({
      onProgress: (_novel, count, total) => {
        if (total > 0) {
          init()
          bar.ratio = count / total
        }
      },
      checkFs
    })
    group.clear()
    output.remove(group)
    output.clearLine()
    console.log(chalk`⸨{yellow ${
      report.updates.length.toString()
    } updated}, {green ${
      report.news.length.toString()
    } new}⸩ ${
      path.basename(novel.container.name || 'unknown')
    }`)
    const newsLength = report.news.length
    for (const { index, chapter } of report.news.slice(0, MAX_LOG)) {
      console.log(chalk`{green ${
        index.toString().padStart(3, '0')
      }} ${chapter.name}`)
    }
    if (report.news.length > MAX_LOG) {
      console.log(chalk`{gray ...}and {green ${newsLength.toString()}} more chapters`)
    }
  }
  output.clear()
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
  .option('check-fs', {
    type: 'boolean',
    default: false,
    desc: 'Download missing files'
  })
