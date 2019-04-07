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
}

interface ProgressParentElement extends ProgressElement {
  addItem (...items: ProgressElement[]): void
  removeItem (...items: ProgressElement[]): void
  update (): void
}

interface ProgressItemOptions {
  width?: number
  minWidth?: number
  maxWidth?: number
  flex?: number
}

export abstract class ProgressItem implements ProgressElement {
  _parent?: ProgressParentElement
  width?: number
  minWidth?: number
  maxWidth?: number
  flex?: number

  constructor (options?: ProgressItemOptions) {
    if (options) {
      this.width = options.width
      this.minWidth = options.minWidth
      this.maxWidth = options.maxWidth
      this.flex = options.flex
    }
  }

  get parent () { return this._parent }
  set parent (nParent) {
    this._parent = nParent
    if (nParent) {
      this.mounted()
    } else {
      this.willUnmount()
    }
  }

  mounted () { return }
  willUnmount () { return }

  abstract render (maxWidth?: number): string
  abstract calculateWidth (): number

  update () {
    const { parent } = this
    if (parent) {
      parent.update()
    }
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

interface ProgressSpinnerStyle {
  interval: number
  frames: string[]
  width: number
}

export class ProgressSpinner extends ProgressItem {
  private interval?: ReturnType<typeof setInterval>
  style: ProgressSpinnerStyle = {
    interval: 80,
    width: 1,
    frames: [
      '⠋',
      '⠙',
      '⠹',
      '⠸',
      '⠼',
      '⠴',
      '⠦',
      '⠧',
      '⠇',
      '⠏'
    ]
  }
  frame = 0

  calculateWidth () {
    return this.requestWidth(this.style.width)
  }

  start () {
    this.interval = setInterval(this.eventLoop, this.style.interval)
  }

  stop () {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  mounted () { this.start() }
  willUnmount () { this.stop() }

  eventLoop = () => {
    this.frame = (this.frame + 1) % this.style.frames.length
    this.update()
  }

  render () {
    let { frame, style: { frames } } = this
    return frames[frame % frames.length]
  }
}

export class ProgressText extends ProgressItem {
  _text = ''
  constructor (options?: ProgressItemOptions & {
    text?: string
  }) {
    super(options)
    if (options) {
      this.text = options.text || ''
    }
  }

  get text () { return this._text }
  set text (value: string) {
    this._text = value
    this.update()
  }

  calculateWidth () {
    let { text } = this
    return this.requestWidth(text.length)
  }

  render (maxWidth?: number) {
    let { text } = this
    const needed = this.flex ? Number.MAX_SAFE_INTEGER : text.length
    const allowed = this.requestWidth(needed, maxWidth)
    if (text.length > allowed) {
      return text.substr(0, allowed - 1) + '…'
    } else if (this.flex) {
      const space = allowed - text.length
      const left = Math.floor(space / 2)
      const right = space - left
      return ' '.repeat(left) + text + ' '.repeat(right)
    }
    return text
  }
}

export class ProgressBar extends ProgressItem {
  symbols = [ '░', '▒', '▓', '█' ]
  _ratio = 0

  constructor (options?: ProgressItemOptions & {
    symbols?: string[]
    ratio?: number
  }) {
    super(options)
    if (options) {
      this.symbols = options.symbols || this.symbols
      this._ratio = options.ratio || this._ratio
    }
  }

  get ratio () { return this._ratio }
  set ratio (value: number) {
    this._ratio = clamp(value, 0, 1)
    this.update()
  }

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
    let { ratio } = this
    const needed = this.flex ? Number.MAX_SAFE_INTEGER : 0
    const allowed = this.requestWidth(needed, maxWidth)
    ratio = clamp(ratio, 0, 1)
    if (!allowed) {
      return ''
    }
    return ProgressBar.renderBar(this.symbols, ratio, allowed).join('')
  }
}

export class ProgressGroup
  extends ProgressItem
  implements ProgressParentElement {
  protected items: ProgressElement[] = []
  private calculated: number[] = []
  private flexSum: number = 0

  update () {
    return
  }

  addItem (...newItems: ProgressElement[]) {
    for (const item of newItems) {
      this.items.push(item)
      item.parent = this
    }
  }

  removeItem (...itemsTobeRemoved: ProgressElement[]) {
    const { items } = this
    for (const item of itemsTobeRemoved) {
      const index = items.indexOf(item)
      if (index >= 0) {
        this.items.splice(index, 1)
        item.parent = undefined
      }
    }
  }

  clearItems () {
    const { items } = this
    for (const item of items) {
      item.parent = undefined
    }
    items.length = 0
  }

  calculateWidth () {
    const { items, calculated } = this
    let flexSum = 0
    let sum = 0
    calculated.length = 0
    for (const item of items) {
      const width = item.calculateWidth()
      sum += width
      flexSum += item.width ? 0 : (item.flex || 0)
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
      const flex = item.width ? 0 : (item.flex || 0)
      if (flex > maxFlex) {
        maxFlex = flex
        maxFlexIndex = index
      }
      const adjust = Math.round(perFlex * flex)
      total -= adjust
      calculated[index] += adjust
    }
    if (total !== 0 && maxFlexIndex >= 0) {
      calculated[maxFlexIndex] += total
      total = 0
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
    const text = this.render(columns)
    cursorTo(stream, 0)
    stream.write(text)
  }

  stop () {
    this.clearItems()
  }
}
