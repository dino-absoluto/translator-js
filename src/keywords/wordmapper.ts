/**
 * @file Words
 * @author Dino <dinoabsoluto+dev@gmail.com>
 * @license
 * This file is part of Translator Toolkit.
 *
 * Translator Toolkit is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Translator Toolkit is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Translator Toolkit.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
/* imports */
import {
  phrases, symbols,
  prefixes, suffixes,
  separators
} from './words'

const ms = (word: string) => phrases[word] || word

interface MapState {
  word: string,
  remain: number
}

const createState = (word: string): MapState =>
  ({ word, remain: word.length })

const replaceSymbols = (() => {
  const set  = new Set(Object.getOwnPropertyNames(symbols))
  set.delete('(')
  set.delete(')')
  set.add('\\(')
  set.add('\\)')
  const keys = [...set].sort().reverse()
  const exp = new RegExp(keys.join('|'), 'gu')
  return (w: MapState) => {
    w.word = w.word.replace(/[\uFF01-\uFF5E]/gu, (tok: string) =>
      (w.remain -= tok.length, String.fromCharCode(tok.charCodeAt(0) - 0xFEE0)))
    w.word = w.word.replace(exp, tok =>
      (w.remain -= tok.length, symbols[tok]))
  }
})()

const replaceLetters = (w: MapState) => {
  w.word = w.word.replace(/\w+/gu, tok =>
    (w.remain -= tok.length, ` ${tok.toUpperCase()}`))
}

const replacePhrases = (() => {
  const keys = Object.getOwnPropertyNames(phrases).sort().reverse()
  const exp = new RegExp(keys.join('|'), 'gu')
  return (w: MapState) => {
    w.word = w.word.replace(exp, tok =>
      (w.remain -= tok.length, ` ${ms(tok)}`))
  }
})()

const replacePrefixes = (() => {
  const keys = Object.getOwnPropertyNames(prefixes).sort().reverse()
  const exp = new RegExp(`^(${keys.join('|')})`, 'gu')
  return (w: MapState) => {
    w.word = w.word.replace(exp, tok =>
      (w.remain -= tok.length, prefixes[tok]))
  }
})()

const replaceSuffixes = (() => {
  const keys = Object.getOwnPropertyNames(suffixes).sort().reverse()
  const exp = new RegExp(`(${keys.join('|')})$`, 'gu')
  return (w: MapState) => {
    w.word = w.word.replace(exp, tok =>
      (w.remain -= tok.length, suffixes[tok]))
  }
})()

const splitFragments = (() => {
  const keys = Object.getOwnPropertyNames(separators).sort().reverse()
  const exp = new RegExp(`(${keys.join('|')})`, 'gu')
  return (word: string) =>
    word.split(exp)
})()

const trim = (word: string) =>
  word.trim().replace(/\s+/gu, ' ')

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
    replacePhrases(state)
    replacePrefixes(state)
    replaceSuffixes(state)
    state.word = trim(state.word)
    if (!lax && state.remain > 0) {
      return word
    }
    return state.word
  } else {
    const MAX = Math.ceil(frs.length / 2)
    let text = ''
    for (let i = 0; i < MAX; i++) {
      const word = frs[i*2]
      const sep = frs[i*2 + 1]
      text += mapKeyword(word)
      if (sep) {
        text += separators[sep] || sep
      }
    }
    return text
  }
}

{
}
