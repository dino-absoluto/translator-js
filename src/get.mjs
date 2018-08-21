#!/usr/bin/env node -r esm
/**
 * @file get.js
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
import chalk from 'chalk'
import { URL } from 'url'
import yargsParser from 'yargs-parser'
import Tale from './get/tale'
import pkgInfo from './info.js'
/* -imports */

const _version = pkgInfo.version

/**
 * Main function
 */
const _main = async () => {
  const argv = yargsParser(process.argv.splice(2), {
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
  // TODO: deprecate --dir
  // if (config.dir.length) {
  //   console.warn(chalk`{yellow warning} usage of {cyan --dir} is deprecated`)
  // }
  let tales = []
  for (const src of config._) {
    try {
      let url = new URL(src)
      tales.push({ url })
    } catch (err) {
      tales.push({
        targetDir: src
      })
    }
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
