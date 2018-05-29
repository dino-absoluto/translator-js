/**
 * @file tale.js
 * @license
 * This file is part of novel-js.
 *
 * novel-js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * novel-js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with novel-js.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
/* Imports */
const path = require('path')
const fs = require('fs')
const {URL} = require('url')
const makeDir = require('make-dir')
const chalk = require('chalk')
const loadJsonFile = require('load-json-file')
const filenamify = require('filenamify')
const engines = require('./engines')

class Volume extends String {
  constructor (index, title) {
    title = title != null ? title.toString().trim() : ''
    if (!Number.isInteger(index)) {
      throw new Error('Integer index required')
    }
    const pathname = filenamify(`${index.toString().padStart(2, '0')} ${title}`)
    super(title)
    Object.defineProperties(this, {
      pathname: { value: pathname }
    })
  }
}

class Chapter {
  constructor (index, data) {
    const title = data.title
    const sign = data.sign
    const pathname = (() => {
      if (data.file != null) {
        return data.file
      }
      let name = `${index.toString().padStart(3, '0')} ${title}.txt`
      if (data.volume != null && data.volume.pathname != null) {
        name = path.join(data.volume.pathname, name)
      }
      return name
    })()
    Object.defineProperties(this, {
      title: { enumerable: true, value: title },
      sign: { enumerable: true, value: sign },
      file: { enumerable: true, value: pathname }
    })
    if (Array.isArray(data.extras) && data.extras.length > 0) {
      const extras = []
      const prefix = `${index.toString().padStart(3, '0')}`
      for (const [i, item] of data.extras.entries()) {
        extras.push({
          url: item.url,
          file: item.file || `${prefix}-${i.toString().padStart(2, '0')} ${item.name}`
        })
      }
      Object.defineProperties(this, {
        extras: { enumerable: true, value: extras }
      })
    }
  }
}

class Tale {
  constructor (options) {
    const minVersion = 1
    const modVersion = 1
    if (options == null) {
      throw new Error('Tale requires options')
    }
    if (options.url == null && options.targetDir == null) {
      throw new Error('Tale requires either <url> or <targetDir>')
    }
    let url = options.url
    let targetDir = options.targetDir
    if (options.targetDir == null) {
      url = new URL(options.url)
      targetDir = path.join('download', filenamify(`${url.host}${url.pathname}`))
      targetDir = path.resolve(targetDir)
    } else {
      targetDir = path.resolve(options.targetDir)
    }
    const indexFile = path.join(targetDir, 'index.json')
    try {
      const data = loadJsonFile.sync(indexFile)
      if (data != null) {
        if (minVersion <= data.version && data.version <= modVersion) {
          options.saveData = data
          if (data.url) {
            if (url != null && url.toString() !== data.url) {
              throw new Error('URL doesn\'t match index file')
            }
            url = data.url
          }
        } else {
          throw new Error('Version check failed')
        }
      }
    } catch (err) {
    }
    Object.defineProperties(this, {
      version: { enumerable: true, value: modVersion },
      url: { enumerable: true, value: url },
      volumes: { enumerable: true, value: [] },
      chapters: { enumerable: true, value: [] },
      targetDir: { value: targetDir },
      indexFile: { value: indexFile }
    })
    if (options.saveData != null) {
      const saveData = options.saveData
      for (const [i, title] of saveData.volumes.entries()) {
        this.volumes.push(new Volume(i, title))
      }
      for (const [i, data] of saveData.chapters.entries()) {
        this.chapters.push(new Chapter(i, data))
      }
    }
  }

  async update () {
    let updater = this._getUpdater()
    let engine = engines(this.url)
    if (engine == null) {
      throw new Error('No engine available.')
    }
    await engine.run(updater)
    return updater
  }

  _getUpdater () {
    let upVolumes = []
    let upChapters = []
    let pendings = []
    const tale = this
    return {
      get url () {
        return tale.url
      },
      addVolume: title => {
        const id = upVolumes.length
        const vol = new Volume(id, title)
        upVolumes.push(vol)
      },
      addChapter: data => {
        const id = upChapters.push(null) - 1
        data.volume = upVolumes[data.volumeIndex]
        pendings.push((async () => {
          const outdated = await (async () => {
            const ch = new Chapter(id, data)
            const xch = tale.chapters[id]
            upChapters[id] = ch
            if (xch == null) {
              return true
            }
            if (ch.sign !== xch.sign || ch.file !== xch.file) {
              return true
            }
            const files = [path.join(tale.targetDir, ch.file)]
            if (xch.extras != null) {
              for (const item of xch.extras) {
                files.push(path.join(tale.targetDir, item.file))
              }
            }
            try {
              await Promise.all(files.map(file => new Promise((resolve, reject) => {
                fs.access(file, (err) => {
                  if (err) {
                    reject(err)
                  } else {
                    resolve()
                  }
                })
              })))
            } catch (err) {
              return true
            }
            return false
          })()
          if (!outdated) {
            return
          }
          return async () => {
            const root = tale.targetDir
            if (data.fetch) {
              data = await data.fetch()
            }
            {
              const xch = tale.chapters[id]
              if (xch != null) {
                try {
                  fs.unlinkSync(path.join(root, xch.file))
                } catch (err) {}
                if (xch.extras != null) {
                  for (const item of xch.extras) {
                    try {
                      fs.unlinkSync(path.join(root, item.file))
                    } catch (err) {}
                  }
                }
              }
            }
            const chapter = new Chapter(id, data)
            const fname = path.join(root, chapter.file)
            const number = id.toString().padStart(3, '0')
            upChapters[id] = chapter
            await makeDir(path.dirname(fname))
            fs.writeFileSync(fname, data.content)
            console.log(chalk`{cyan ${number}} ${chapter.title}`)
            if (chapter.extras != null) {
              for (const [i, extra] of chapter.extras.entries()) {
                const fname = path.join(root, extra.file)
                fs.writeFileSync(fname, data.extras[i].content)
              }
              console.log(chalk`{gray ${''.padStart(number.length, ' ')}}`,
                chalk`{gray +${chapter.extras.length} extra files}`)
            }
            tale.chapters[id] = chapter
          }
        })())
      },
      async finalize () {
        const actions = (await Promise.all(pendings)).filter(act => act != null)
        const offset = upChapters.length - tale.chapters.length
        for (const [i, vol] of upVolumes.entries()) {
          tale.volumes[i] = vol
        }
        tale.volumes.length = upVolumes.length
        if (actions.length > 0) {
          console.log(chalk`Lastest chapter: {cyan ${upChapters.length - 1}}`,
            chalk`{gray |} Outdated: {red ${actions.length}}`)
        }
        for (const fn of actions) {
          await fn()
          const json = JSON.stringify(tale, null, 1)
          fs.writeFileSync(tale.indexFile, json)
        }
        tale.chapters.length = upChapters.length
        if (actions.length > 0) {
          console.log(chalk`{cyan ^${actions.length}} updates`)
          if (offset > 0) {
            console.log(chalk`{green +${offset}} chapters`)
          } else if (offset < 0) {
            console.log(chalk`{red -${-offset}} chapters`)
          }
        }
      }
    }
  }
}

module.exports = Tale
