import { createReadStream, unlinkSync } from 'fs'
import { getFileNameExtension, hashCode } from './common'
import { GEN_THUMBNAIL_VIDEO_LIST, USERNAME } from './constant'
import { getExists } from './fs'
import * as gm from 'gm'
import * as thumbsupply from 'thumbsupply'

export const getThumbnail = async (path: string) => {
  const pathId = hashCode(path)
  const thumbnailPath = `/Users/${USERNAME}/.gagu/thumbnail/thumbnail-${pathId}.png`

  if (getExists(thumbnailPath)) {
    return thumbnailPath
  }

  const extension = getFileNameExtension(path) as string
  let targetPath = path

  const isGenVideo = GEN_THUMBNAIL_VIDEO_LIST.includes(extension)
  if (isGenVideo) {
    const cacheThumbnailPath = await thumbsupply.generateThumbnail(path, {
      cacheDir: `/Users/${USERNAME}/.gagu/cache`,
      mimetype: 'video/mp4',
      timestamp: '10%',
    })
    targetPath = cacheThumbnailPath
  }

  await new Promise(async (resolve, reject) => {

  gm(createReadStream(targetPath))
    .selectFrame(4)
    .resize(100)
    .noProfile()
    .write(thumbnailPath, (err) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        resolve(thumbnailPath)
        isGenVideo && unlinkSync(targetPath)
      }
    })
  })
  return thumbnailPath
}
