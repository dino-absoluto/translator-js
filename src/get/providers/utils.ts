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
import { flow, trim } from '../../utils/flow'
import { JSDOM } from 'jsdom'
import * as mime from 'mime'
import fetch from '../../utils/syosetu-fetch'

/* code */
export const fetchDOM = async (url: string): Promise<Document> => {
  let { window: { document: doc } } =
    new JSDOM(await (await fetch(url)).text(), { url })
  return doc
}

interface FetchedFile {
  url: string
  buf: Buffer
  name: string
}

export const fetchFile = async (url: string): Promise<FetchedFile> => {
  const res = await fetch(url)
  const buf = await res.buffer()
  {
    const disp = res.headers.get('content-disposition')
    if (disp) {
      const name = trim(flow(disp.match(/; filename="[^"]+"/))
        .then((a): string => a[1]).value)
      if (name) {
        return {
          url,
          buf,
          name
        }
      }
    }
  }
  {
    const type = res.headers.get('content-type')
    if (type) {
      const ext = flow(trim(type.split(';')[0]))
        .then(mime.getExtension).value
      if (ext) {
        return {
          url,
          buf,
          name: `untitled.${ext}`
        }
      }
    }
  }
  return {
    url,
    buf,
    name: 'untitled'
  }
}
