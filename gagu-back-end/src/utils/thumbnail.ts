import { readFileSync } from 'fs'
import * as gm from 'gm'
import { hashCode } from './common'
import { USERNAME } from './constant'
import { getExists } from './fs'

export const getThumbnail = async (path: string) => {
  const pathId = hashCode(path)
  const thumbnailPath = `/Users/${USERNAME}/.gagu/thumbnail/thumbnail-${pathId}.png`
  if (getExists(thumbnailPath)) {
    return thumbnailPath
  }
  await new Promise((resolve, reject) => {
    gm(readFileSync(path))
      .selectFrame(4)
      .resize(100)
      .noProfile()
      .write(thumbnailPath, (err) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          resolve(thumbnailPath)
        }
      })
  })
  return thumbnailPath
}
