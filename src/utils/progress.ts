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
import stringWidth = require('string-width')

/* code */
// █████▒░░░░░░░░░
// ██████▓░░░░░░░░
// █████████████▓░
// █▓▒░▒▓█

const getLength = (() => {
  try {
    // throw new Error('a')
    const getLength: typeof stringWidth = require('string-width')
    return getLength
  } catch {
    return (text: string) => text.length
  }
})()

export namespace Progress {

interface Element {
  width?: number
  minWidth?: number
  maxWidth?: number
  flex?: number
  calculateWidth (): number
  render (maxWidth?: number): string
}

interface ChildElement extends Element {
  parent?: ParentElement
  mounted (parent: ParentElement): void
  willUnmount (parent: ParentElement): void
}

type FrameFn = () => void

interface ParentElement extends Element {
  children: ChildElement[]
  addItem (...items: ChildElement[]): void
  removeItem (...items: ChildElement[]): void
  update (): void
  addFrameEvent (cb: FrameFn): void
  removeFrameEvent (cb: FrameFn): void
}

interface ItemOptions {
  width?: number
  minWidth?: number
  maxWidth?: number
  flex?: number
}

export abstract class Item implements Element, ChildElement {
  _parent?: ParentElement
  width?: number
  minWidth?: number
  maxWidth?: number
  flex?: number
  private willUpdate = false

  constructor (options?: ItemOptions) {
    if (options) {
      this.width = options.width
      this.minWidth = options.minWidth
      this.maxWidth = options.maxWidth
      this.flex = options.flex
    }
  }

  get parent () { return this._parent }
  set parent (parent: ParentElement | undefined) {
    const { _parent } = this
    if (_parent) {
      this.willUnmount(_parent)
    }
    this._parent = parent
    if (parent) {
      this.mounted(parent)
    }
  }

  update () {
    if (this.willUpdate) {
      return
    }
    this.willUpdate = true
    setImmediate(() => this.onUpdate())
    return false
  }

  onUpdate () {
    this.willUpdate = false
    const { parent } = this
    if (parent) {
      parent.update()
    }
  }

  abstract render (maxWidth?: number): string
  abstract calculateWidth (): number
  mounted (_parent: ParentElement) { return }
  willUnmount (_parent: ParentElement) { return }

  protected requestWidth (need: number, maxWidth?: number): number {
    let minWidth
    minWidth = Math.max(this.minWidth || 0, 0)
    maxWidth = Math.min(maxWidth || this.maxWidth || Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER)
    const width = clamp(this.width || need, minWidth, maxWidth)
    return width
  }
}

interface SpinnerStyle {
  interval: number
  frames: string[]
  width: number
}

export class Spinner extends Item {
  width = 1
  style: SpinnerStyle = {
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

  mounted (parent: ParentElement) {
    parent.addFrameEvent(this.onFrame)
  }

  willUnmount (parent: ParentElement) {
    parent.removeFrameEvent(this.onFrame)
  }

  onFrame = () => {
    this.frame = (this.frame + 1) % this.style.frames.length
    this.update()
  }

  render () {
    let { frame, style: { frames } } = this
    return frames[frame % frames.length]
  }
}

export class Text extends Item {
  _text = ''
  constructor (options?: ItemOptions & {
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
    return this.requestWidth(getLength(text))
  }

  render (maxWidth?: number) {
    let { text } = this
    const length = getLength(text)
    const needed = this.flex ? Number.MAX_SAFE_INTEGER : length
    const allowed = this.requestWidth(needed, maxWidth)
    if (length > allowed) {
      return text.substr(0, allowed - 1) + '…'
    } else if (this.flex) {
      const space = allowed - length
      const left = Math.floor(space / 2)
      const right = space - left
      return ' '.repeat(left) + text + ' '.repeat(right)
    }
    return text
  }
}

export class Bar extends Item {
  symbols = [ '░', '▒', '▓', '█' ]
  _ratio = 0

  constructor (options?: ItemOptions & {
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
    return Bar.renderBar(this.symbols, ratio, allowed).join('')
  }
}

export class Group
  extends Item
  implements ParentElement {
  readonly children: ChildElement[] = []
  private calculated: number[] = []
  private flexSum: number = 0
  private frameEvents = new Set<FrameFn>()
  private interval?: ReturnType<typeof setTimeout>

  onFrame = () => {
    for (const fn of this.frameEvents) {
      fn()
    }
  }

  addFrameEvent (cb: FrameFn) {
    const { frameEvents } = this
    frameEvents.add(cb)
    if (frameEvents.size > 0) {
      if (!this.interval) {
        this.interval = setInterval(this.onFrame, 80)
      }
    }
  }

  removeFrameEvent (cb: FrameFn) {
    this.frameEvents.delete(cb)
    if (this.frameEvents.size === 0) {
      if (this.interval) {
        clearInterval(this.interval)
      }
      this.interval = undefined
    }
  }

  addItem (...newItems: ChildElement[]) {
    const { children } = this
    for (const item of newItems) {
      children.push(item)
      item.parent = this
    }
  }

  removeItem (...itemsTobeRemoved: ChildElement[]) {
    const { children } = this
    for (const item of itemsTobeRemoved) {
      const index = children.indexOf(item)
      if (index >= 0) {
        children.splice(index, 1)
        item.parent = undefined
      }
    }
  }

  clearItems () {
    const { children } = this
    for (const item of children) {
      item.parent = undefined
    }
    children.length = 0
  }

  calculateWidth () {
    const { children, calculated } = this
    let flexSum = 0
    let sum = 0
    calculated.length = 0
    for (const item of children) {
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
    const { children, flexSum, calculated } = this
    const perFlex = (allowed - actual) / flexSum
    let total = allowed - actual
    let maxFlex = 0
    let maxFlexIndex = -1
    for (const [index, item] of children.entries()) {
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
    return children.map((item, index) => {
      return item.render(calculated[index])
    }).join('')
  }
}

export class Progress extends Group {
  stream = process.stdout
  flex = 1
  count = 0

  clear () {
    const { stream } = this
    clearLine(stream, 0)
    cursorTo(stream, 0)
  }

  get columns () {
    return this.stream.columns || 40
  }

  onUpdate () {
    super.onUpdate()
    const { stream, columns } = this
    const text = this.render(columns)
    cursorTo(stream, 0)
    stream.write(text)
    this.count++
  }
}

}
