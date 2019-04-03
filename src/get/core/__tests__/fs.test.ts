/**
 * @file Files management
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
import { Container } from '../fs'
import * as path from 'path'
/* code */

describe('Container', () => {
  test('constructor.1', async () => {
    const cont = new Container({
      outputDir: path.resolve(__dirname, '__tmp__'),
      name: 'cont1'
    })
    expect(() => cont.name = 'cont1-renamed').toThrow('Can\'t be rename')
  })
  test('constructor.2', async () => {
    console.log(path.resolve('__tmp__'))
    const cont = new Container({
      outputDir: path.resolve(__dirname, '__tmp__'),
      name: 'cont2',
      canRename: true
    })
    expect(() => cont.name = 'cont2-renamed').not.toThrow()
  })
})
