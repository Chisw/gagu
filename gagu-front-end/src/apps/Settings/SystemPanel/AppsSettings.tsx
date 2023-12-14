import { Divider, Form } from '@douyinfe/semi-ui'
import { useTouchMode } from '../../../hooks'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { UserConfigStore } from '../../../utils'

export default function AppsSettings() {

  const { t } = useTranslation()

  const touchMode = useTouchMode()

  const [userConfig, setUserConfig] = useState(UserConfigStore.get())

  useEffect(() => {
    UserConfigStore.set(userConfig)
  }, [userConfig])

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
