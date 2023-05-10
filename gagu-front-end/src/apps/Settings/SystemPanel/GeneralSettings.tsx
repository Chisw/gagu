import { useTranslation } from 'react-i18next'
import { languageList, setLanguage } from '../../../i18n'
import { Form } from '@douyinfe/semi-ui'
import { SvgIcon } from '../../../components/base'
import { line, refreshBackground } from '../../../utils'
import { useCallback, useRef } from 'react'
import { useFetch } from '../../../hooks'
import { FsApi } from '../../../api'

export default function GeneralSettings() {
  const { t, i18n: { language } } = useTranslation()

  const fileInputRef = useRef<any>(null)

  const { fetch: uploadBackground } = useFetch(FsApi.uploadBackground)

  const handleFileChange = useCallback(async (name: string) => {
    const file = fileInputRef?.current?.files[0]
    await uploadBackground(name, file)
    refreshBackground('desktop')
  }, [uploadBackground])

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
          <Form.Slot label={t`label.desktopWallpaper`}>
            <div
              className={line(`
                relative w-32 h-24
                border-2 border-dashed border-gray-300 hover:border-blue-500 hover:border-solid
                text-gray-500 rounded-md flex justify-center items-center
              `)}
            >
              <div className="absolute z-0 inset-0 flex justify-center items-center">
                <SvgIcon.ImageAdd size={48} className="text-gray-200" />
              </div>
              <div
                className="gagu-background-desktop absolute z-10 inset-0 m-1 bg-cover bg-no-repeat bg-center rounded"
                style={{ backgroundImage: `url("${FsApi.getBackgroundStreamUrl('desktop')}")` }}
              />
              <input
                ref={fileInputRef}
                type="file"
                className="absolute z-20 block w-full h-full opacity-0 cursor-pointer"
                onChange={() => handleFileChange('desktop')}
              />
            </div>
          </Form.Slot>
        </Form>
      </div>
    </>
  )
}
