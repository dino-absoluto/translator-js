/**
 * @author Dino <dinoabsoluto+dev@gmail.com>
 * @license
 * Copyright 2019 Dino <dinoabsoluto+dev@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/* imports */
import { Provider, Novel } from './common'
/* code */

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
  let value = domains.get(url.host)
  if (!value) {
    throw new Error('no matching provider')
  }
  return value
}

export const getNovel = async (url: URL): Promise<Novel> => {
  const provider = await getProvider(url)
  let value = provider.fromURL(url)
  if (!value) {
    throw new Error('failed to create Novel instance')
  }
  return value
}
