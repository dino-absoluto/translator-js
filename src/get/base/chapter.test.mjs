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
import fs from 'fs'
import del from 'del'
import makeDir from 'make-dir'
/* -imports */

const __tmpdir = path.resolve('__tmp__/tests')

test('init with minimum data', async () => {
  let ch = new Chapter({
    index: 2,
    title: 'Prologue'
  })
  expect(ch.prefix).toBe('002')
  await ch.update()
  await ch.didUpdate()
  expect(ch.index).toBe(2)
  expect(ch.files.length).toBe(1)
  {
    const f = ch.files[0]
    expect(f.fname).toBe('002 Prologue.txt')
    expect(f.integrity).toBe(undefined)
    expect(f.relative).toBe('002 Prologue.txt')
    expect(f.absolute).toBe(path.resolve('002 Prologue.txt'))
  }
  ch = JSON.parse(JSON.stringify(ch))
  expect(ch).toEqual({
    title: 'Prologue',
    files: [
      {
        fname: '002 Prologue.txt'
      }
    ]
  })
})

test('init with volume', async () => {
  let volume = new Volume({
    index: 1,
    title: 'Chapter One',
    base: 'test'
  })
  let ch = new Chapter({
    index: 2,
    title: 'Prologue',
    integrity: 'prologue',
    volume
  })
  expect(volume.index).toBe(1)
  expect(ch.prefix).toBe('002')
  await ch.update()
  await ch.didUpdate()
  expect(ch.index).toBe(2)
  expect(ch.integrity).toBe('prologue')
  expect(ch.files.length).toBe(1)
  {
    const f = ch.files[0]
    expect(f.fname).toBe('002 Prologue.txt')
    expect(f.integrity).toBe(undefined)
    expect(f.relative).toBe('01 Chapter One/002 Prologue.txt')
    expect(f.absolute).toBe(path.resolve('test/01 Chapter One/002 Prologue.txt'))
  }
  ch = JSON.parse(JSON.stringify(ch))
  expect(ch).toEqual({
    title: 'Prologue',
    integrity: 'prologue',
    volume: 1,
    files: [
      {
        fname: '002 Prologue.txt'
      }
    ]
  })
})

test('patch', async () => {
  const prefix = `${__tmpdir}/chapter__simple-update/`
  await del(prefix)
  await makeDir(`${prefix}01 Chapter One`)
  fs.writeFileSync(`${prefix}01 Chapter One/002 Prologue.txt`, '')
  let volume = new Volume({
    index: 1,
    title: 'Chapter One',
    base: prefix
  })
  let ch = new Chapter({
    index: 2,
    title: 'Prologue',
    volume
  })
  ch = await ch.patch({
    integrity: 1
  }, false)
  {
    let spies = ['update', 'willUpdate', 'didUpdate'].map(
      name => jest.spyOn(ch, name))
    expect(ch.props.patch).not.toBeUndefined()
    expect(await ch.isPending()).toBe(true)
    spies.forEach(spy => expect(spy).not.toHaveBeenCalled())
    await ch.run()
    spies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1))
  }
  ch = await ch.patch({
    integrity: 1
  }, false)
  {
    let spies = ['update', 'willUpdate', 'didUpdate'].map(
      name => jest.spyOn(ch, name))
    expect(ch.props.patch).not.toBeUndefined()
    expect(await ch.isPending()).toBe(false)
    await ch.run()
    spies.forEach(spy => expect(spy).toHaveBeenCalledTimes(0))
  }
})
