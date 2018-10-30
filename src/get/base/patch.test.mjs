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
import BasePatch from './patch'
/* -imports */

class Patch extends BasePatch {
}

test('init with no data', async () => {
  let p = new Patch()
  let r = await p.patch({}, false)
  expect(r).not.toBe(p)
  expect(r).not.toBeUndefined()
  expect(r).toEqual(expect.any(BasePatch))
  expect(r).toEqual(expect.any(Patch))
  expect(await r.isPending()).toBe(false)
  let spy = jest.spyOn(r, 'update')
  await r.run()
  expect(spy).not.toHaveBeenCalled()
  expect(r.props).toEqual({})
})

test('init with minimum data', async () => {
  let patch = { text: 'Hello!' }
  let p = new Patch()
  let r = await p.patch(patch, false)
  expect(r).not.toBe(p)
  expect(r).not.toBeUndefined()
  expect(r).toEqual(expect.any(BasePatch))
  expect(r).toEqual(expect.any(Patch))
  expect(await r.isPending()).toBe(true)
  let spy = jest.spyOn(r, 'update')
  await r.run()
  expect(spy).toHaveBeenCalled()
  expect(r.props).toEqual(patch)
})
