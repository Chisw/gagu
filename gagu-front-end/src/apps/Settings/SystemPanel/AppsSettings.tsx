import { Button, Divider, Form, Input } from '@douyinfe/semi-ui'
import { useTouchMode, useUserConfig } from '../../../hooks'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect } from 'react'
import { SvgIcon } from '../../../components/common'
import { useRecoilState } from 'recoil'
import { entrySelectorEventState, openEventState } from '../../../states'
import { AppId, EntryType, EventTransaction } from '../../../types'

export default function AppsSettings() {

  const { t } = useTranslation()

  const touchMode = useTouchMode()

  const [, setEntrySelectorEvent] = useRecoilState(entrySelectorEventState)
  const [openEvent, setOpenEvent] = useRecoilState(openEventState)

  const { userConfig, setUserConfig } = useUserConfig()

  const handleSelectClick = useCallback(() => {
    setEntrySelectorEvent({
      transaction: EventTransaction.settings_default_path,
      mode: 'open',
      appId: AppId.settings,
      type: EntryType.directory,
    })
  }, [setEntrySelectorEvent])

  useEffect(() => {
    if (openEvent?.transaction === EventTransaction.settings_default_path) {
      const fileExplorerDefaultPath: string = openEvent.extraData?.selectedPath
      setUserConfig({ ...userConfig, fileExplorerDefaultPath })
      setOpenEvent(null)
    }
  }, [openEvent, userConfig, setOpenEvent, setUserConfig])

  return (
    <div className="max-w-lg">
      <Form
        labelPosition={touchMode ? 'top' : 'left'}
        labelAlign={touchMode ? 'left' : 'right'}
        labelWidth={200}
      >
        <Divider margin="12px" align="left">
          {t`app.file-explorer`}
        </Divider>
        <Form.Slot label={t`label.defaultPath`}>
          <div className="flex">
            <Input
              readOnly
              readonly
              showClear
              onClear={() => setUserConfig({ ...userConfig, fileExplorerDefaultPath: '' })}
              placeholder={t`hint.choose`}
              autoComplete="off"
              value={userConfig.fileExplorerDefaultPath}
            />
            <Button
              className="ml-1 flex-shrink-0"
              onClick={handleSelectClick}
            >
              <SvgIcon.FolderOpen />
            </Button>
          </div>
        </Form.Slot>
        <Form.Switch
          field="fileExplorerAutoOpen"
          label={t`label.fileExplorerAutoOpen`}
          extraText={t`hint.fileExplorerAutoOpen_extra`}
          initValue={userConfig.fileExplorerAutoOpen}
          onChange={(fileExplorerAutoOpen) => setUserConfig({ ...userConfig, fileExplorerAutoOpen })}
        />
      </Form>
    </div>
  )
}
