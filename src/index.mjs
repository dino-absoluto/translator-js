/**
 * @file index.mjs
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
import getEngine from './get'
import chalk from 'chalk'
import info from './config.js'
import yargs from 'yargs'
import globby from 'globby'
import path from 'path'
/* -imports */

const report = (error) => {
  console.error(chalk`{red ${report.stack ? error.stack : error}}`)
  if (report.pedantic) {
    process.exit(-1)
  }
}
report.pedantic = true

const _postParse = (config) => {
  report.stack = !!config.stack
  report.pedantic = !!config.pedantic
}

const _glob = async (config) => {
  if (config.sources && config.sources.length) {
    return
  }
  let indexes = await globby(path.join(config.output, '**/index.json'))
  config.sources = indexes.map(fpath => path.dirname(fpath))
}

const _get = async (config) => {
  let output = config.output || './download/'
  for (const source of config.sources) {
    try {
      let engine = getEngine({
        source,
        verbose: true,
        chdir: output,
        overwrite: config.force
      })
      await engine.refresh()
    } catch (error) {
      report(error)
      process.exit(-1)
    }
  }
}

const cmdGet = async (config) => {
  await _postParse(config)
  await _glob(config)
  await _get(config)
}

const _parseArgs = async () => {
  return yargs.strict(true)
    .usage('$0 get [--output=<path>] [options] [<URL> | <path>..]')
    .help('help').alias('help', 'h')
    .version(info.version)
    .group([ 'help', 'version' ], 'Info:')
    .option('stack', {
      hidden: true,
      default: false,
      type: 'boolean'
    })
    .option('output', {
      alias: ['o'],
      default: 'download',
      type: 'string',
      desc: 'Output directory'
    })
    .option('force', {
      alias: ['f'],
      default: false,
      type: 'boolean',
      desc: 'Overwrite untracked files'
    })
    .option('pedantic', {
      default: true,
      type: 'boolean',
      desc: 'Exit on first error'
    })
    .command(
      'get [<sources>..]',
      'Get RAWs',
      yargs => yargs.strict()
        .usage('$0 get [--output=<path>] [options] [<URL> | <path>..]')
        .argv,
      cmdGet
    )
    .demandCommand(1)
    .fail(err => {
      yargs.showHelp()
      report(err)
    })
    .argv
}

/**
 * Main function
 */
const _main = async () => {
  await _parseArgs()
}

_main().catch(report)
