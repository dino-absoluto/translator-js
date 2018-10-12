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

let stack = false

const _parseArgs = async () => {
  const argv = yargsParser(process.argv.splice(2), {
    alias: {
      version: ['v'],
      output: ['o']
    },
    boolean: [ 'version', 'stack' ]
  })
  delete argv['v']
  delete argv['o']
  const config = {
    _: [],
    'version': false,
    'stack': argv.stack,
    'output': './download/'
  }
  stack = !!config.stack
  for (const arg in argv) {
    if (config[arg] != null) {
      config[arg] = argv[arg]
    } else {
      throw new Error(`Unknown arguments: ${arg}`)
    }
  }
  return config
}

const _get = async (config) => {
  let output = config.output || './download/'
  for (const source of config._) {
    let engine = getEngine({
      source,
      verbose: true,
      chdir: output
    })
    await engine.refresh()
  }
}

/**
 * Main function
 */
const _main = async () => {
  const config = await _parseArgs()
  if (!config) {
    return
  }
  if (config.version) {
    console.log(info.version)
  }
  await _get(config)
}

_main().catch(err => console.error(chalk`{red ${stack ? err.stack : err}}`))
