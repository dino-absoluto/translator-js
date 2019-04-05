/**
 * @file Test default context
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
// import * as pfs from '../../../utils/pfs'
import { hash } from '../../../utils/test-utils'
import got from '../../../utils/syosetu-got'
import { JSDOM } from 'jsdom'
import { SimpleContext } from '../context'

/* setup */

/* code */
describe('Context', () => {
  const url = new URL('https://ncode.syosetu.com/n0537cm/21/')
  test('constructor', async () => {
    const { window: { document: doc } } =
      new JSDOM((await got(url)).body, { url: url.toString() })
    const context = new SimpleContext()
    const honbun = doc.getElementById('novel_honbun')
    expect(honbun).not.toBeNull()
    const toks = SimpleContext.tokenize(honbun as Exclude<typeof honbun, null>)
    // await pfs.writeFile(__dirname + '/__tmp__/context.md', fakeRender(toks))
    expect(await hash(context.render(toks))).toMatchSnapshot()
  })
})
