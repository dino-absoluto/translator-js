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
import { parser as yargs } from './shared'
import * as cmdGet from '../get/cli-interface'
import chalk from 'chalk'
import { Progress, ProgressBar, ProgressText, ProgressSpinner } from '../utils/progress'

try {
  yargs
    .command(cmdGet)
    .help()
    .fail((msg, err) => {
      yargs.showHelp()
      if (err) {
        console.log(chalk.red(err.stack || ''))
      } else {
        console.error(chalk.red(msg))
      }
    })
    .command('test', false,
      yargs =>
        yargs,
      async _argv => {
        const progress = new Progress()
        const barLeft = new ProgressBar({
          width: 20
        })
        progress.addItem(barLeft)
        progress.addItem(new ProgressText({ text: ' ' }))
        progress.addItem(new ProgressText({
          text: chalk.green('Hello World!')
        }))
        progress.addItem(new ProgressText({ text: ' ' }))
        const spinner = new ProgressSpinner()
        progress.addItem(spinner)
        progress.addItem(new ProgressText({ text: ' ' }))
        progress.addItem(new ProgressText({
          text: 'Hello World!'
        }))
        progress.addItem(new ProgressText({ text: ' ' }))
        const bar = new ProgressBar({
          width: 20,
          flex: 4,
          ratio: .1
        })
        progress.addItem(bar)
        progress.update()
        let count = 0
        const loop = setInterval(() => {
          barLeft.ratio += 0.03
          bar.ratio += .015
          if (barLeft.ratio >= 1) {
            barLeft.ratio = 0
          }
          if (bar.ratio >= 1) {
            bar.ratio = 0
            if (count++ > 3) {
              clearInterval(loop)
              progress.stop()
              console.log()
            }
          }
        }, 150)
        return
      })
    .parse()
} catch (err) {
  console.error(chalk.red((err.stack || '').toString()))
}
