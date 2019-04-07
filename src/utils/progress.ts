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
import _clamp = require('lodash/clamp')
import _defaults = require('lodash/defaults')
import _orderBy = require('lodash/orderBy')
import stringWidth = require('string-width')

/* code */
// █████▒░░░░░░░░░
// ██████▓░░░░░░░░
// █████████████▓░
// █▓▒░▒▓█

const getLength = (() => {
  try {
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
  flexGrow: number
  flexShrink: number
  /** Calculate uninhibited length */
  calculateWidth (): number
  /** Render item with max-width */
  render (maxWidth?: number): string
  /** Trigger an update */
  update (): void
}

interface ChildElement extends Element {
  id?: number
  parent?: ParentElement
  mounted (parent: ParentElement): void
  willUnmount (parent: ParentElement): void
}

type FrameFn = () => void

interface ParentElement extends Element {
  children: ChildElement[]
  addItem (...items: ChildElement[]): void
  removeItem (...items: ChildElement[]): void
  addFrameEvent (cb: FrameFn): void
  removeFrameEvent (cb: FrameFn): void
}

interface ItemOptions {
  width?: number
  minWidth?: number
  maxWidth?: number
  flex?: number
  flexGrow?: number
  flexShrink?: number
  postProcess?: (...values: string[]) => string
}

export abstract class Item implements Element, ChildElement {
  id?: number
  _parent?: ParentElement
  width?: number
  _minWidth: number = 0
  _maxWidth: number = Number.MAX_SAFE_INTEGER
  _flexGrow: number = 0
  _flexShrink: number = 0
  postProcess?: (...values: string[]) => string
  private willUpdate = false

  constructor (options?: ItemOptions) {
    if (options) {
      this.width = options.width
      this.minWidth = options.minWidth || 0
      this.maxWidth = options.maxWidth || Number.MAX_SAFE_INTEGER
      this.postProcess = options.postProcess
      if (options.flex) {
        this.flex = options.flex
      }
      if (options.flexGrow) {
        this.flexGrow = options.flexGrow
      }
      if (options.flexShrink) {
        this.flexShrink = options.flexShrink
      }
    }
  }

  get minWidth () { return this._minWidth }
  get maxWidth () { return this._maxWidth }
  set minWidth (width: number) {
    this._minWidth = Math.max(width || 0, 0)
  }
  set maxWidth (width: number) {
    this._maxWidth = Math.min(width || Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER)
  }

  private isFlexible () {
    return !(this.width || (this.minWidth === this.maxWidth))
  }

  get flexGrow () { return this.isFlexible() ? this._flexGrow : 0 }
  set flexGrow (flex: number) {
    this._flexGrow = Math.max(0, flex || 0)
  }

  get flexShrink () { return this.isFlexible() ? this._flexShrink : 0 }
  set flexShrink (flex: number) {
    this._flexShrink = Math.max(0, flex || 0)
  }

  set flex (flex: number) {
    this.flexGrow = flex
    this.flexShrink = flex
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

  protected wrap (...text: string[]): string {
    if (this.postProcess) {
      return this.postProcess(...text)
    }
    return text.join('')
  }

  update () {
    if (this.willUpdate) {
      return
    }
    this.willUpdate = true
    setImmediate(() => this.onUpdate())
    return false
  }

  protected onUpdate () {
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
}

interface SpinnerStyle {
  frames: string[]
  width: number
}

export class Spinner extends Item {
  width = 1
  style: SpinnerStyle = {
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
    return this.style.width
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

  render (maxWidth?: number) {
    if (maxWidth === 0) {
      return ''
    }
    let { frame, style: { frames } } = this
    return this.wrap(frames[frame % frames.length])
  }
}

export enum TextAlignment {
  Left = 'left',
  Center = 'center',
  Right = 'right'
}

export class Text extends Item {
  _text = ''
  align: TextAlignment = TextAlignment.Center
  constructor (options?: ItemOptions & {
    text?: string
    align?: TextAlignment
  }) {
    super(_defaults(options, {
      flexShrink: 1
    }))
    if (options) {
      this.text = options.text || this.text
      this.align = options.align || this.align
    }
  }

  get text () { return this._text }
  set text (value: string) {
    this._text = value
    this.update()
  }
  get length () { return getLength(this.text) }

  calculateWidth () {
    return _clamp(this.length, this.minWidth, this.maxWidth)
  }

  grow (width: number) {
    let { text } = this
    const space = width - this.length
    let left = 0
    if (this.align === TextAlignment.Center) {
      left = Math.floor(space / 2)
    } else if (this.align === TextAlignment.Right) {
      left = space
    }
    const right = space - left
    return ' '.repeat(left) + text + ' '.repeat(right)
  }

  shrink (width: number) {
    if (width <= 0) {
      return ''
    }
    return this.text.substr(0, width - 1) + '…'
  }

  render (maxWidth?: number) {
    if (maxWidth === 0) {
      return ''
    }
    let { text } = this
    const growable = !!(maxWidth && this.flexGrow)
    const shrinkable = !!this.flexShrink
    maxWidth = Math.min(
      maxWidth != null ? maxWidth : Number.MAX_SAFE_INTEGER, this.maxWidth)
    const length = this.length
    if (growable && length < maxWidth) {
      return this.wrap(this.grow(maxWidth))
    } else if (shrinkable && length > maxWidth) {
      return this.wrap(this.shrink(maxWidth))
    }
    const { minWidth } = this
    if (length < minWidth) {
      return this.wrap(this.grow(minWidth))
    }
    return this.wrap(text)
  }
}

export class Space extends Item {
  calculateWidth () {
    return _clamp(this.width || 1, this.minWidth, this.maxWidth)
  }

  render (maxWidth?: number) {
    if (maxWidth === 0) {
      return ''
    }
    const growable = !!(maxWidth && this.flexGrow)
    const shrinkable = !!this.flexShrink
    maxWidth = Math.min(
      maxWidth != null ? maxWidth : Number.MAX_SAFE_INTEGER, this.maxWidth)
    const width = this.calculateWidth()
    if ((growable && width < maxWidth) ||
      (shrinkable && width > maxWidth)) {
      return ' '.repeat(maxWidth)
    }
    return ' '.repeat(width)
  }
}

export class Bar extends Item {
  symbols = [ '░', '▒', '▓', '█' ]
  _ratio = 0

  constructor (options?: ItemOptions & {
    symbols?: string[]
    ratio?: number
  }) {
    super(_defaults(options, {
      minWidth: 5
    }))
    if (options) {
      this.symbols = options.symbols || this.symbols
      this._ratio = options.ratio || this._ratio
      // this.flex = options.flex || 0
    }
  }

  get ratio () { return this._ratio }
  set ratio (value: number) {
    this._ratio = _clamp(value, 0, 1)
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
    return _clamp(this.width || 0, this.minWidth, this.maxWidth)
  }

  render (maxWidth?: number) {
    if (maxWidth === 0) {
      return ''
    }
    let { ratio } = this
    const growable = !!(maxWidth && this.flexGrow)
    const shrinkable = !!this.flexShrink
    maxWidth = Math.min(maxWidth || Number.MAX_SAFE_INTEGER, this.maxWidth)
    let width = this.calculateWidth()
    if (growable && width < maxWidth) {
      width = maxWidth
    } else if (shrinkable && width > maxWidth) {
      width = maxWidth
    }
    return this.wrap(...Bar.renderBar(this.symbols, ratio, width))
  }
}

export class Group
  extends Item
  implements ParentElement {
  readonly children: ChildElement[] = []
  flexGrowSum: number = 0
  flexShrinkSum: number = 0
  growableChildren: ChildElement[] = []
  shrinkableChildren: ChildElement[] = []

  private frameEvents = new Set<FrameFn>()
  private interval?: ReturnType<typeof setTimeout>

  get flexGrow () {
    return this.flexGrowSum && this.growableChildren.length / this.children.length
  }
  get flexShrink () {
    return this.flexShrinkSum && this.shrinkableChildren.length / this.children.length
  }
  set flexGrow (_flex: number) { return }
  set flexShrink (_flex: number) { return }

  protected onFrame = () => {
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
      const id = children.length
      children.push(item)
      item.parent = this
      item.id = id
    }
    this.updateFlex()
  }

  removeItem (...itemsTobeRemoved: ChildElement[]) {
    const { children } = this
    for (const item of itemsTobeRemoved) {
      const index = children.indexOf(item)
      if (index >= 0) {
        children.splice(index, 1)
        item.parent = undefined
        item.id = undefined
      }
    }
    this.updateFlex()
  }

  clearItems () {
    const { children } = this
    for (const item of children) {
      item.parent = undefined
    }
    children.length = 0
  }

  protected updateFlex () {
    const {
      children,
      growableChildren,
      shrinkableChildren } = this
    let flexGrowSum = 0
    let flexShrinkSum = 0
    growableChildren.length = 0
    shrinkableChildren.length = 0
    for (const item of children) {
      if (item.flexGrow) {
        flexGrowSum += item.flexGrow
        growableChildren.push(item)
      }
      if (item.flexShrink) {
        flexShrinkSum += item.flexShrink
        shrinkableChildren.push(item)
      }
    }
    _orderBy(growableChildren, [ 'flexGrow', 'id' ], [ 'desc', 'asc' ])
    _orderBy(shrinkableChildren, [ 'flexShrink', 'id' ], [ 'desc', 'asc' ])
    this.flexGrowSum = flexGrowSum
    this.flexShrinkSum = flexShrinkSum
  }

  private growRound (
    widths: number[],
    delta: number, method: typeof Math.ceil) {
    const { growableChildren } = this
    let perFlex = delta / this.flexGrow
    for (const item of growableChildren) {
      const adjust = _clamp(method(item.flexGrow * perFlex), 0, delta)
      const id = item.id as number
      delta -= adjust
      widths[id] += adjust
      if (delta === 0) {
        break
      }
    }
    return delta
  }
  private grow (widths: number[], wantWidth: number, maxWidth: number) {
    let delta = maxWidth - wantWidth
    delta = this.growRound(widths, delta, Math.floor)
    if (delta > 0) {
      delta = this.growRound(widths, delta, Math.round)
    }
  }

  private shrinkRound (
    widths: number[],
    delta: number, method: typeof Math.ceil) {
    const { shrinkableChildren } = this
    let totalBasis = 0
    const bases = shrinkableChildren.map(item => {
      const id = item.id as number
      const basis = widths[id] * item.flexShrink
      totalBasis += basis
      return basis
    })
    const perFlex = delta / totalBasis
    for (const [index, item] of shrinkableChildren.entries()) {
      const basis = bases[index]
      const adjust = _clamp(method(basis * perFlex), 0, delta)
      const id = item.id as number
      delta -= adjust
      widths[id] -= adjust
      if (delta === 0) {
        break
      }
    }
    return delta
  }

  private shrink (widths: number[], wantWidth: number, maxWidth: number) {
    let delta = wantWidth - maxWidth
    delta = this.shrinkRound(widths, delta, Math.floor)
    // console.log(wantWidth, maxWidth, delta, widths)
    if (delta > 0) {
      delta = this.shrinkRound(widths, delta, Math.ceil)
      // console.log(wantWidth, maxWidth, delta, widths)
    }
  }

  render (maxWidth?: number) {
    if (maxWidth === 0) {
      return ''
    }
    const { children } = this
    const growable = !!(maxWidth && this.flexGrow)
    const shrinkable = !!this.flexShrink
    maxWidth = Math.min(maxWidth || Number.MAX_SAFE_INTEGER, this.maxWidth)
    const widths: number[] = []
    let wantWidth = 0
    for (const item of children) {
      const width = item.calculateWidth()
      widths.push(width)
      wantWidth += width
    }
    if (growable && wantWidth < maxWidth) {
      this.grow(widths, wantWidth, maxWidth)
    } else if (shrinkable && wantWidth > maxWidth) {
      this.shrink(widths, wantWidth, maxWidth)
    }
    let text = this.children.map((item, id) => {
      return item.render(widths[id])
    }).join('')
    return this.wrap(text)
  }

  calculateWidth () {
    const { children } = this
    let sum = 0
    for (const item of children) {
      const width = item.calculateWidth()
      sum += width
    }
    return sum
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

  clearItems () {
    super.clearItems()
    this.clear()
  }

  get columns () {
    return this.stream.columns || 40
  }

  protected onUpdate () {
    super.onUpdate()
    const { stream, columns } = this
    const text = this.render(columns)
    cursorTo(stream, 0)
    stream.write(text)
    this.count++
  }
}

}
