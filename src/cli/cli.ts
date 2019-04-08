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
import { Progress } from '../utils/progress'

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
        const progress = new Progress.Progress()
        const group = new Progress.Group({ flex: 1 })
        const barLeft = new Progress.Bar({
          width: 20,
          postProcess: (...cols) => {
            return chalk.green(cols[0]) + chalk.yellow(cols[1]) + chalk.gray(cols[2])
          }
        })
        group.add(new Progress.Text({ text: '⸨', flexShrink: 0 }))
        group.add(barLeft)
        group.add(new Progress.Text({ text: '⸩', flexShrink: 0 }))
        group.add(new Progress.Space())
        group.add(new Progress.Text({
          text: 'Hello! Welcome to Hell!',
          align: Progress.TextAlignment.Left,
          postProcess: chalk.green
        }))
        progress.add(group)
        const spinner = new Progress.Spinner({ postProcess: chalk.blue })
        group.add(spinner)
        progress.add(spinner)
        progress.add(new Progress.Spinner({ postProcess: chalk.yellow }))
        progress.add(new Progress.Spinner({ postProcess: chalk.yellow }))
        progress.add(new Progress.Space())
        const label = new Progress.Text({
          text: 'Hello World!',
          flex: 1,
          postProcess: chalk.gray
        })
        progress.add(label)
        progress.add(new Progress.Space())
        const bar = new Progress.Bar({
          width: 20,
          flex: 1,
          ratio: .1,
          postProcess: (...cols) => {
            return chalk.gray(cols[2]) + chalk.yellow(cols[1]) + chalk.green(cols[0])
          }
        })
        progress.add(new Progress.Text({ text: '⸨', flexShrink: 0 }), 0)
        progress.add(bar, 1)
        progress.add(new Progress.Text({ text: '⸩', flexShrink: 0 }), 2)
        progress.update()
        let count = 0
        let lcount = 0
        const loop = setInterval(() => {
          lcount++
          label.text = `Hello World! ${lcount}`
          barLeft.ratio += 0.03
          bar.ratio += .015
          if (barLeft.ratio >= 1) {
            barLeft.ratio = 0
          }
          if (bar.ratio >= 1) {
            if (label.parent) {
              progress.delete(label)
            }
            progress.clearLine()
            console.log('Looped')
            bar.ratio = 0
            if (count++ > 3) {
              clearInterval(loop)
              progress.clear()
              console.log(progress.count * 1000 / progress.elapsed)
            }
          }
        }, 40)
        return
      })
    .parse()
} catch (err) {
  console.error(chalk.red((err.stack || '').toString()))
}
