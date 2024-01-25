import { useTranslation } from 'react-i18next'
import { Form } from '@douyinfe/semi-ui'
import { SvgIcon } from '../../../components/common'
import { line, refreshImage, setFavicon } from '../../../utils'
import { useCallback, useRef } from 'react'
import { useRequest, useTouchMode } from '../../../hooks'
import { FsApi } from '../../../api'

export default function ImageSettings() {
  const { t } = useTranslation()

  const touchMode = useTouchMode()

  const faviconFileInputRef = useRef<any>(null)
  const desktopWallpaperFileInputRef = useRef<any>(null)
  const sharingWallpaperFileInputRef = useRef<any>(null)

  const { request: createPublicImage } = useRequest(FsApi.createPublicImage)

  const handleFaviconChange = useCallback(async () => {
    const file = faviconFileInputRef?.current?.files[0]
    await createPublicImage('favicon', file)
    refreshImage('favicon')
    setFavicon(FsApi.getPublicImageStreamUrl('favicon'))
  }, [createPublicImage])

  const handleDesktopWallpaperChange = useCallback(async () => {
    const file = desktopWallpaperFileInputRef?.current?.files[0]
    await createPublicImage('bg-desktop', file)
    refreshImage('bg-desktop')
  }, [createPublicImage])

  const handleSharingWallpaperChange = useCallback(async () => {
    const file = sharingWallpaperFileInputRef?.current?.files[0]
    await createPublicImage('bg-sharing', file)
    refreshImage('bg-sharing')
  }, [createPublicImage])

  return (
    <>
      <div className="mt-2 mx-auto max-w-lg">
        <Form
          labelPosition={touchMode ? 'top' : 'left'}
          labelAlign={touchMode ? 'left': 'right'}
          labelWidth={200}
        >
          <Form.Slot label={t`label.favicon`}>
            <div
              className={line(`
                relative z-0 w-12 h-12
                border-2 border-dashed border-gray-300 hover:border-blue-500 hover:border-solid
                text-gray-500 rounded flex justify-center items-center
                dark:border-zinc-600 dark:hover:border-blue-600
              `)}
            >
              <div className="absolute z-0 inset-0 flex justify-center items-center">
                <SvgIcon.ImageAdd size={24} className="text-gray-200" />
              </div>
              <div
                className="gagu-public-image-favicon absolute z-10 inset-0 m-1 bg-cover bg-no-repeat bg-top rounded-sm"
                style={{ backgroundImage: `url("${FsApi.getPublicImageStreamUrl('favicon')}")` }}
              />
              <input
                ref={faviconFileInputRef}
                type="file"
                className="absolute z-20 block w-full h-full opacity-0 cursor-pointer"
                onChange={() => handleFaviconChange()}
              />
            </div>
          </Form.Slot>
          <Form.Slot label={t`label.desktopWallpaper`}>
            <div
              className={line(`
                relative w-48 h-32
                border-2 border-dashed border-gray-300 hover:border-blue-500 hover:border-solid
                text-gray-500 rounded flex justify-center items-center
                dark:border-zinc-600 dark:hover:border-blue-600
              `)}
            >
              <div className="absolute z-0 inset-0 flex justify-center items-center">
                <SvgIcon.ImageAdd size={48} className="text-gray-200" />
              </div>
              <div
                className="gagu-public-image-bg-desktop absolute z-10 inset-0 m-1 bg-cover bg-no-repeat bg-center rounded-sm"
                style={{ backgroundImage: `url("${FsApi.getPublicImageStreamUrl('bg-desktop')}")` }}
              />
              <input
                ref={desktopWallpaperFileInputRef}
                type="file"
                className="absolute z-20 block w-full h-full opacity-0 cursor-pointer"
                onChange={() => handleDesktopWallpaperChange()}
              />
            </div>
          </Form.Slot>
          <Form.Slot label={t`label.sharingPageWallpaper`}>
            <div
              className={line(`
                relative w-48 h-32
                border-2 border-dashed border-gray-300 hover:border-blue-500 hover:border-solid
                text-gray-500 rounded flex justify-center items-center
                dark:border-zinc-600 dark:hover:border-blue-600
              `)}
            >
              <div className="absolute z-0 inset-0 flex justify-center items-center">
                <SvgIcon.ImageAdd size={48} className="text-gray-200" />
              </div>
              <div
                className="gagu-public-image-bg-sharing absolute z-10 inset-0 m-1 bg-cover bg-no-repeat bg-center rounded-sm"
                style={{ backgroundImage: `url("${FsApi.getPublicImageStreamUrl('bg-sharing')}")` }}
              />
              <input
                ref={sharingWallpaperFileInputRef}
                type="file"
                className="absolute z-20 block w-full h-full opacity-0 cursor-pointer"
                onChange={() => handleSharingWallpaperChange()}
              />
            </div>
          </Form.Slot>
        </Form>
      </div>
    </>
  )
}
