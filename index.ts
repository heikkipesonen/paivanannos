import * as fs from 'fs'
import * as path from 'path'

import { adjectives } from './adjectives'

const readFolderContents = (p: string): string[] =>
  [].concat.apply(
    [],
    fs.readdirSync(p).map((item) => {
      const entry = fs.statSync(path.resolve(p, item))

      if (entry.isDirectory()) {
        return [].concat.apply([], readFolderContents(path.resolve(p, item)))
      }

      if (entry.isFile()) {
        return path.resolve(p, item)
      }

      return []
    })
  )

const getLineCount = (pathLike: string): Promise<number> =>
  new Promise((resolve) => {
    let count = 0
    fs.createReadStream(pathLike)
      .on('data', (chunk) => {
        for (let i = 0; i < chunk.length; i++) if (chunk[i] == 10) count++
      })
      .on('end', () => {
        resolve(count)
      })
  })

const readFile = (pathLike: string) => fs.readFileSync(path.resolve(pathLike)).toString()

const uniq = (xs: string[]): string[] =>
  Object.keys(
    xs.reduce<Record<string, string>>((p, c) => {
      p[c] = c
      return p
    }, {})
  )

const getAdjectives = () =>
  uniq(
    Array(Math.ceil(Math.random() * 5) + 3)
      .fill(false)
      .map(() => adjectives[Math.floor(Math.random() * adjectives.length)].toLowerCase())
  ).join(', ')

const template = (file: string) => (lines: number) =>
  `
  Päivän annoksen HERKKU-webstorea saat nauttimalla ${lines} riviä ${file}. ${getAdjectives()}.
  `

const getDailyPortion = async () => {
  const cwd = path.resolve('../herkku-web-store')
  const contents = readFolderContents(path.resolve(cwd, 'src'))
  const file = contents[Math.floor(Math.random() * contents.length)]
  const count = await getLineCount(path.resolve(file))

  console.log(readFile(file))
  return template(file.replace(cwd, ''))(count)
}

getDailyPortion().then(console.log)
