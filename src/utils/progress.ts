/**
 * @file Progress
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
// import chalk from 'chalk'
import { clearLine, cursorTo } from 'readline'
import clamp = require('lodash/clamp')

/* code */
// █████▒░░░░░░░░░
// ██████▓░░░░░░░░
// █████████████▓░
// █▓▒░▒▓█

// const getLength = (text: string) => text.length

interface ProgressElement {
  parent?: ProgressParentElement
  width?: number
  minWidth?: number
  maxWidth?: number
  flex?: number
  calculateWidth (): number
  render (maxWidth?: number): string
  update (data?: unknown): void
}

interface ProgressParentElement extends ProgressElement {
  addItem (...items: ProgressElement[]): void
  removeItem (...items: ProgressElement[]): void
  update (): void
}

export abstract class ProgressItem implements ProgressElement {
  parent?: ProgressParentElement
  width?: number
  minWidth?: number
  maxWidth?: number
  flex?: number

  abstract render (maxWidth?: number): string
  abstract calculateWidth (): number

  update () {
    const { parent } = this
    parent && parent.update()
  }

  protected requestWidth (need: number, maxWidth?: number): number {
    let minWidth
    minWidth = Math.max(this.minWidth || 0, 0)
    maxWidth = Math.min(maxWidth || this.maxWidth || Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER)
    const width = clamp(this.width || need, minWidth, maxWidth)
    return width
  }
}

export class ProgressBar extends ProgressItem {
  symbols = [ '░', '▒', '▓', '█' ]
  flex = 1
  private _ratio = 0

  static renderBar (symbols: string[], ratio: number, width: number): string[] {
    const stage = symbols.length - 1
    const count = Math.floor(width * stage * ratio)
    const progress = count % stage
    const fill = Math.floor((count - progress) / stage)
    const empty = width - ((progress && 1) || 0) - fill
    return [
      symbols[symbols.length - 1].repeat(fill),
      (progress && symbols[progress] || ''),
      symbols[0].repeat(empty)
    ]
  }

  calculateWidth () {
    return this.requestWidth(0)
  }

  render (maxWidth?: number) {
    const needed = this.flex ? Number.MAX_SAFE_INTEGER : 0
    const allowed = this.requestWidth(needed, maxWidth)
    const ratio = clamp(this._ratio, 0, 1)
    if (!allowed) {
      return ''
    }
    return ProgressBar.renderBar(this.symbols, ratio, allowed).join('')
  }

  get ratio () { return this._ratio }
  set ratio (ratio: number) {
    this._ratio = clamp(ratio, 0, 1)
    this.update()
  }
}

export class ProgressGroup
  extends ProgressItem
  implements ProgressParentElement {
  private items: ProgressElement[] = []
  private calculated: number[] = []
  private flexSum: number = 0

  update () {
    return
  }

  addItem (...newItems: ProgressItem[]) {
    for (const item of newItems) {
      item.parent = this
      this.items.push(item)
    }
  }

  removeItem (...itemsTobeRemoved: ProgressItem[]) {
    const { items } = this
    for (const item of itemsTobeRemoved) {
      const index = items.indexOf(item)
      if (index >= 0) {
        delete item.parent
        this.items.splice(index, 1)
      }
    }
  }

  calculateWidth () {
    const { items, calculated } = this
    let flexSum = 0
    let sum = 0
    calculated.length = 0
    for (const item of items) {
      const width = item.calculateWidth()
      sum += width
      flexSum += item.flex || 0
      calculated.push(width)
    }
    this.flexSum = flexSum
    return sum
  }

  render (maxWidth?: number) {
    if (maxWidth && maxWidth <= 0) {
      return ''
    }
    const actual = this.calculateWidth()
    const allowed = this.requestWidth(
      this.flex ? Number.MAX_SAFE_INTEGER : actual, maxWidth)
    const { items, flexSum, calculated } = this
    const perFlex = (allowed - actual) / flexSum
    let total = allowed - actual
    let maxFlex = 0
    let maxFlexIndex = -1
    for (const [index, item] of items.entries()) {
      const flex = item.flex || 0
      if (flex > maxFlex) {
        maxFlex = flex
        maxFlexIndex = index
      }
      const adjust = Math.round(perFlex * (item.flex || 0))
      total -= adjust
      calculated[index] += adjust
    }
    if (total !== 0 && maxFlexIndex >= 0) {
      calculated[maxFlexIndex] += total
    }
    return items.map((item, index) => {
      return item.render(calculated[index])
    }).join('')
  }
}

export class Progress extends ProgressGroup {
  stream = process.stdout
  flex = 1

  clear () {
    const { stream } = this
    clearLine(stream, 0)
    cursorTo(stream, 0)
  }

  get columns () {
    return this.stream.columns || 40
  }

  update () {
    const { stream, columns } = this
    this.clear()
    stream.write(this.render(columns))
  }
}
