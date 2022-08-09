import { readdirSync, statSync } from 'fs'
import { IEntry } from 'src/types'

export const getEntries: (p: string) => IEntry[] = (absPath) => {
  const entryNameList = readdirSync(absPath)
  const files = entryNameList
    .map((name: string) => {
      try {
        const entryPath = `${absPath}/${name}`
        const stat = statSync(entryPath)
        const isDirectory = stat.isDirectory()
        const type = isDirectory ? 'directory' : 'file'
        const size = isDirectory ? undefined : stat.size
        const hidden = name.startsWith('.')
        const lastModified = stat.ctimeMs
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
