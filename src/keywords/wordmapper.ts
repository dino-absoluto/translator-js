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
import { map } from './words'

const ws = (word: string) => map[word] || word

const wm = (word: string) => {
  if (map[word]) {
    return map[word]
  }
  return word.split(/[・、]/g).map(ws).join('·')
}

export default wm
