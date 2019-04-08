/**
 * @author Dino <dinoabsoluto+dev@gmail.com>
 * @license
 * Translator-js - Scripts to facilitate Japanese webnovel
 * Copyright (C) 2019 Dino <dinoabsoluto+dev@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */
/* imports */
import globby, { GlobbyOptions } from 'globby'
import hasha = require('hasha')
import * as path from 'path'
import del from 'del'
import makeDir = require('make-dir')
import { back as nockBack, NockBackContext } from 'nock'

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
  let nock: { nockDone: () => void, context: NockBackContext }
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
