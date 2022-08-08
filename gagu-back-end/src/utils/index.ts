import { readdirSync, statSync } from 'fs'
import { IEntry } from 'src/types'

export const getEntries: (p: string) => IEntry[] = (path) => {
  const entryNameList = readdirSync(path)
  const files = entryNameList
    .map((name: string) => {
      try {
        const entryPath = `${path}/${name}`
        const stat = statSync(entryPath)
        const isDirectory = stat.isDirectory()
        const type = isDirectory ? 'directory' : 'file'
        const size = isDirectory ? undefined : stat.size
        const hidden = name.startsWith('.')
        const lastModified = new Date(stat.birthtime).getTime()
        return {
          name,
          type,
          size,
          hidden,
          lastModified,
          hasChildren: false,
        }
      } catch (err) {
        console.log('ERR:', 'getEntries', err)
        return null
      }
    })
    .filter(Boolean) as IEntry[]
  return files
}
