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
import { SharedOptions, Cmd } from '../cli/shared'
import * as FlexProgress from '@dinoabsoluto/flex-progress'
import * as path from 'path'
import * as kleur from 'kleur'
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
  process.on('SIGINT', () => {
    output.clear(false)
    process.exit(0)
  })
  try {
    output.append(
      new FlexProgress.HideCursor(), 1,
      new FlexProgress.Spinner({ postProcess: kleur.cyan }), 1)
    for (const novelData of novels) {
      const novel = new Series(novelData)
      const group = new FlexProgress.Group()
      const bar = new FlexProgress.Bar({
        width: 20
      , postProcess:
        overArgs((...s: string[]) => s.join(''),
          kleur.green, kleur.yellow, kleur.gray)
      })
      const label = new FlexProgress.Text({
        text: '', postProcess: kleur.yellow
      })
      const init = once(() => {
        group.append(
          '⸨', bar, '⸩'
        , 1, label, new FlexProgress.Text({
          text: path.basename(novel.container.name || 'unknown')
        , flex: {
          shrink: 1,
          grow: 0
        }
        }))
        // output.add(group, 0)
        output.append(group)
      })
      await novel.ready
      const report = await novel.updateIndex({
        onProgress: (_novel, count, total) => {
          if (total > 0) {
            init()
            label.text = count + '/' + total + ' '
            bar.ratio = count / total
          }
        },
        checkFs
      })
      group.clear()
      output.remove(group)
      output.clearLine()
      console.log(kleur.blue('·'),
        kleur.yellow(report.updates.length.toString() + ' updated') + ',',
        kleur.green(report.news.length.toString() + ' new'),
        kleur.gray('-'),
        path.basename(novel.container.name || 'unknown')
      )
      const newsLength = report.news.length
      for (const { index, chapter } of report.news.slice(0, MAX_LOG)) {
        console.log(
          kleur.green(index.toString().padStart(3, '0')),
          chapter.name
        )
      }
      if (report.news.length > MAX_LOG) {
        console.log(
          kleur.gray('...') + 'and',
          kleur.green(newsLength.toString()),
          'more chapters')
      }
    }
  } finally {
    output.clear()
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
  .option('check-fs', {
    type: 'boolean',
    default: false,
    desc: 'Download missing files'
  })
