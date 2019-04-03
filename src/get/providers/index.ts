/**
 * @file index.ts
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
import { Provider } from './common'
/* code */
export { Provider }

let initialized: Promise<void>
const domains = new Map()

export const register = (provider: Provider) => {
  for (const domain of provider.acceptDomains) {
    if (domains.has(domain)) {
      throw new Error(`'${domain}' domain existed`)
    }
    domains.set(domain, provider)
  }
}

export const getProvider = async (url: URL): Promise<Provider> => {
  if (!initialized) {
    initialized = (async () => {
      register((await import('./syosetu')).default)
    })()
    await initialized
    return getProvider(url)
  }
  return domains.get(url.hostname)
}

export default getProvider
