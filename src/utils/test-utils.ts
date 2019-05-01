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
import globby, { GlobbyOptions } from 'globby'
import * as path from 'path'
import del from 'del'
import { back as nockBack, NockBackContext } from 'nock'
import hasha = require('hasha')
import makeDir = require('make-dir')

/* setup */
const SRC_DIR = path.normalize(__dirname + '/../')
const TMP_DIR = path.resolve('__tmp__/jest/')
const FIXTURES_DIR = path.resolve('__tmp__/nock-fixtures')
nockBack.fixtures = FIXTURES_DIR
nockBack.setMode('record')

/* code */
export const setupTmpDir = (name: string) => {
  const fpath = path.join(TMP_DIR, name)
  beforeAll(async () => {
    await del(path.join(fpath, '*'))
    await makeDir(fpath)
  })
  return fpath
}

interface TestEnvSetupOptions {
  network?: boolean
}

export const setup = (fname: string, options: TestEnvSetupOptions = {}) => {
  const unit = path.posix.normalize(path.relative(SRC_DIR, fname))
    .replace(/\/([^\/]+)\/__tests__\//g, '/$1__')
  const tmpdir = path.join(TMP_DIR, unit)
  let nock: { nockDone: () => void; context: NockBackContext }
  beforeAll(async () => {
    await del(path.join(tmpdir, '*'))
    await makeDir(tmpdir)
    if (options.network) {
      nock = await nockBack(unit + '.json')
    }
  })
  afterAll(async () => {
    if (nock && nock.nockDone) {
      await nock.nockDone()
    }
  })
  return {
    __TMPDIR: tmpdir
  }
}

export const hashDir = async (
  patt: string | ReadonlyArray<string>,
  options: GlobbyOptions
) => {
  let files = await globby(patt, options)
  files = files.sort()
  const cwd = options.cwd || path.resolve('.')
  const arrays = await Promise.all(files.map(async (fname: string) => {
    let content = await hasha.fromFile(fname, {
      encoding: 'base64'
    })
    return {
      fname: path.posix.normalize(path.relative(cwd, fname)),
      content
    }
  }))
  const data: { [id: string]: string } = {}
  for (const { fname, content } of arrays) {
    data[fname] = content || ''
  }
  return data
}

export const hash = async (data: any) => {
  let text: string
  if (typeof data === 'string') {
    text = data
  } else {
    text = JSON.stringify(data)
  }
  return hasha(text, {
    encoding: 'base64'
  })
}
