import { useTranslation } from 'react-i18next'
import { languageList, setLanguage } from '../../../i18n'
import { Form } from '@douyinfe/semi-ui'
import { SvgIcon } from '../../../components/base'
import { line, refreshImage, setFavicon } from '../../../utils'
import { useCallback, useRef } from 'react'
import { useRequest } from '../../../hooks'
import { FsApi } from '../../../api'

export default function GeneralSettings() {
  const { t, i18n: { language } } = useTranslation()

  const faviconFileInputRef = useRef<any>(null)
  const desktopWallpaperFileInputRef = useRef<any>(null)
  const sharingWallpaperFileInputRef = useRef<any>(null)

  const { request: uploadImage } = useRequest(FsApi.uploadImage)

  const handleFaviconChange = useCallback(async () => {
    const file = faviconFileInputRef?.current?.files[0]
    await uploadImage('favicon', file)
    refreshImage('favicon')
    setFavicon(FsApi.getImageStreamUrl('favicon'))
  }, [uploadImage])

  const handleDesktopWallpaperChange = useCallback(async () => {
    const file = desktopWallpaperFileInputRef?.current?.files[0]
    await uploadImage('bg-desktop', file)
    refreshImage('bg-desktop')
  }, [uploadImage])

  const handleSharingWallpaperChange = useCallback(async () => {
    const file = sharingWallpaperFileInputRef?.current?.files[0]
    await uploadImage('bg-sharing', file)
    refreshImage('bg-sharing')
  }, [uploadImage])

  return (
    <>
      <div className="mx-auto max-w-lg">
        <Form
          labelPosition="left"
          labelWidth={200}
          labelAlign="right"
        >
          <Form.Select
            field="language"
            label={t`label.language`}
            className="w-full"
            optionList={languageList.map(({ key, name }) => ({ label: name, value: key }))}
            initValue={language}
            onChange={(key) => setLanguage(key as any as string)}
          />
          <Form.Slot label={t`label.favicon`}>
            <div
              className={line(`
                relative z-0 w-12 h-12
                border-2 border-dashed border-gray-300 hover:border-blue-500 hover:border-solid
                text-gray-500 rounded flex justify-center items-center
              `)}
            >
              <div className="absolute z-0 inset-0 flex justify-center items-center">
                <SvgIcon.ImageAdd size={24} className="text-gray-200" />
              </div>
              <div
                className="gagu-public-image-favicon absolute z-10 inset-0 m-1 bg-cover bg-no-repeat bg-top rounded-sm"
                style={{ backgroundImage: `url("${FsApi.getImageStreamUrl('favicon')}")` }}
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
              `)}
            >
              <div className="absolute z-0 inset-0 flex justify-center items-center">
                <SvgIcon.ImageAdd size={48} className="text-gray-200" />
              </div>
              <div
                className="gagu-public-image-bg-desktop absolute z-10 inset-0 m-1 bg-cover bg-no-repeat bg-center rounded-sm"
                style={{ backgroundImage: `url("${FsApi.getImageStreamUrl('bg-desktop')}")` }}
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
              `)}
            >
              <div className="absolute z-0 inset-0 flex justify-center items-center">
                <SvgIcon.ImageAdd size={48} className="text-gray-200" />
              </div>
              <div
                className="gagu-public-image-bg-sharing absolute z-10 inset-0 m-1 bg-cover bg-no-repeat bg-center rounded-sm"
                style={{ backgroundImage: `url("${FsApi.getImageStreamUrl('bg-sharing')}")` }}
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
