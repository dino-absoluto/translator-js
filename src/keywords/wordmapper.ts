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
import {
  phrases, symbols,
  prefixes, suffixes,
  separators, particles
} from './words'

const ms = (word: string) => phrases[word] || word

interface MapState {
  word: string
  remain: number
}

const createState = (word: string): MapState =>
  ({ word, remain: word.length })

const replaceSymbols = (() => {
  const set = new Set(Object.getOwnPropertyNames(symbols))
  set.delete('(')
  set.delete(')')
  set.add('\\(')
  set.add('\\)')
  const keys = [...set].sort().reverse()
  const exp = new RegExp(keys.join('|'), 'gu')
  return (w: MapState) => {
    w.word = w.word.replace(/[\uFF01-\uFF5E]/g, (tok: string) =>
      (w.remain -= tok.length, String.fromCharCode(tok.charCodeAt(0) - 0xFEE0)))
    w.word = w.word.replace(exp, tok =>
      (w.remain -= tok.length, symbols[tok]))
  }
})()

const replaceLetters = (w: MapState) => {
  w.word = w.word.replace(/\w+/g, tok =>
    (w.remain -= tok.length, ` ${tok.toUpperCase()}`))
}

const replacePhrases = (() => {
  const keys = Object.getOwnPropertyNames(phrases).sort().reverse()
  const exp = new RegExp(keys.join('|'), 'g')
  return (w: MapState) => {
    w.word = w.word.replace(exp, tok =>
      (w.remain -= tok.length, ` ${ms(tok)}`))
  }
})()

const replacePrefixes = (() => {
  const keys = Object.getOwnPropertyNames(prefixes).sort().reverse()
  const exp = new RegExp(`^(${keys.join('|')})\s*`, 'g')
  return (w: MapState) => {
    w.word = w.word.replace(exp, tok =>
      (w.remain -= tok.length, prefixes[tok]))
  }
})()

const replaceSuffixes = (() => {
  const keys = Object.getOwnPropertyNames(suffixes).sort().reverse()
  const exp = new RegExp(`\s*(${keys.join('|')})$`, 'g')
  return (w: MapState) => {
    w.word = w.word.replace(exp, tok =>
      (w.remain -= tok.length, suffixes[tok]))
  }
})()

const processParticles = (() => {
  const keys = Object.getOwnPropertyNames(particles).sort().reverse()
  const exp = new RegExp(`(?<=\\s|\\w)(${keys.join('|')})(?=\\s|\\w)`, 'g')
  return (w: MapState) => {
    const [left, key] = w.word.split(exp, 2)
    if (!key) {
      return
    }
    const right = w.word.substring(left.length + key.length)
    w.remain -= key.length
    const particle = particles[key]
    if (typeof particle === 'string') {
      w.word = left + particle + right
    } else {
      w.word = particle(key, left, right)
    }
  }
})()

const splitFragments = (() => {
  const keys = Object.getOwnPropertyNames(separators).sort().reverse()
  const exp = new RegExp(`(${keys.join('|')})`, 'g')
  return (word: string) =>
    word.split(exp)
})()

const trim = (word: string) =>
  word.trim().replace(/\s+/g, ' ').replace(/(?<=[\-(])\s/g, '')

export const mapKeyword = (word: string, lax?: boolean) => {
  word = word.trim().toLowerCase()
  if (phrases[word]) {
    return phrases[word]
  }
  const frs = splitFragments(word)
  if (frs.length === 1) {
    const state = createState(word)
    replaceSymbols(state)
    replaceLetters(state)
    replaceSuffixes(state)
    replacePhrases(state)
    replacePrefixes(state)
    processParticles(state)
    state.word = trim(state.word)
    if (!lax && state.remain > 0) {
      return word
    }
    return state.word
  } else {
    const MAX = Math.ceil(frs.length / 2)
    let text = ''
    for (let i = 0; i < MAX; i++) {
      const word = frs[i * 2]
      const sep = frs[i * 2 + 1]
      text += mapKeyword(word)
      if (sep) {
        text += separators[sep] || sep
      }
    }
    return text
  }
}
