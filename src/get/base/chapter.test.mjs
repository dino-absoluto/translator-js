/**
 * @file Get module
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
/* eslint-env jest */
/* imports */
import Chapter from './chapter'
import Volume from './volume'
import path from 'path'
/* -imports */

test('init with minimum data', () => {
  let ch = new Chapter({
    index: 2,
    title: 'Prologue'
  })
  expect(ch.base).toBe(path.resolve('.'))
  expect(ch.dirname).toBe(path.resolve('.'))
})

test('init with base', () => {
  let ch = new Chapter({
    index: 2,
    title: 'Prologue',
    base: 'test'
  })
  expect(ch.base).toBe(path.resolve('./test'))
  expect(ch.dirname).toBe(path.resolve('./test'))
})

test('init with volume', () => {
  let volume = new Volume({
    index: 1,
    title: 'Chapter One',
    base: 'test'
  })
  let ch = new Chapter({
    index: 2,
    title: 'Prologue',
    volume
  })
  expect(ch.base).toBe(path.resolve('./test'))
  expect(ch.dirname).toBe(path.resolve('./test/01 Chapter One'))
})
