#!/usr/bin/env node
/**
 * @file get.js
 * @license
 * This file is part of novel-js.
 *
 * novel-js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * novel-js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with novel-js.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

const chalk = require('chalk')
const process = require('process')

const Tale = require('./get/tale')

const _version = require('../package.json').version

/**
 * Main function
 */
const _main = async () => {
  const argv = require('yargs-parser')(process.argv.splice(2), {
    alias: {
      version: ['v']
    },
    array: 'dir',
    boolean: 'version'
  })
  delete argv['v']
  const config = {
    _: [],
    'dir': [],
    'version': false
  }
  for (const arg in argv) {
    if (config[arg] != null) {
      config[arg] = argv[arg]
    } else {
      throw new Error(`Unknown arguments: ${arg}`)
    }
  }
  if (config.version) {
    console.log(_version)
    return
  }
  let tales = []
  for (const url of config._) {
    tales.push({ url })
  }
  for (const dir of config.dir) {
    tales.push({
      targetDir: dir
    })
  }
  for (const options of tales) {
    if (options.url != null) {
      console.log(chalk`{green ==>} URL {blueBright ${options.url}}`)
    } else {
      console.log(chalk`{green ==>} Directory {blueBright ${options.targetDir}}`)
    }
    const tale = new Tale(options)
    const updater = await tale.update()
    await updater.finalize()
  }
}

_main().catch(err => console.error(chalk`{red ${err.stack}}`))
