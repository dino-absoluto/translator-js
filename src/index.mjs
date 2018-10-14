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
import yargsParser from 'yargs-parser'
import info from './config.js'
/* -imports */

const report = (error) => {
  console.error(chalk`{red ${report.stack ? error.stack : error}}`)
  if (report.pedantic) {
    process.exit(-1)
  }
}

report.pedantic = true

const _parseArgs = async () => {
  const argv = yargsParser(process.argv.splice(2), {
    alias: {
      version: ['v'],
      output: ['o'],
      help: ['h'],
      force: ['f']
    },
    boolean: [ 'version', 'stack', 'help', 'pedantic' ]
  })
  delete argv['v']
  delete argv['o']
  delete argv['h']
  delete argv['f']
  const config = {
    _: [],
    'help': false,
    'version': false,
    'stack': argv.stack,
    'output': './download/',
    'force': false,
    'pedantic': true
  }
  for (const arg in argv) {
    if (config[arg] != null) {
      config[arg] = argv[arg]
    } else {
      throw new Error(`Unknown arguments: ${arg}`)
    }
  }
  report.stack = !!config.stack
  report.pedantic = !!config.pedantic
  return config
}

const _get = async (config) => {
  let output = config.output || './download/'
  for (const source of config._) {
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
    }
  }
}

const _printUsage = () => {
  return console.log(info.usage)
}

/**
 * Main function
 */
const _main = async () => {
  const config = await _parseArgs().catch(err => {
    console.log(chalk`{red ${err}}`)
    _printUsage()
  })
  if (!config) {
    return
  }
  if (config.version) {
    return console.log(info.version)
  }
  if (config.help) {
    return console.log(info.usage)
  }
  await _get(config)
}

_main().catch(report)
