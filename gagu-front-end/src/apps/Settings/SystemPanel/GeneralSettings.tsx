import { useTranslation } from 'react-i18next'
import { languageList, setLanguage } from '../../../i18n'
import { Button, Divider, Form, Input, Radio, RadioGroup } from '@douyinfe/semi-ui'
import { SvgIcon } from '../../../components/common'
import { useTouchMode, useUserConfig } from '../../../hooks'
import { AppId, ColorScheme, EntryType, HotkeyStyle } from '../../../types'
import { EntryPicker, EntryPickerMode } from '../../../components'
import { useState } from 'react'

export default function GeneralSettings() {
  const { t, i18n: { language } } = useTranslation()

  const touchMode = useTouchMode()

  const { userConfig, setUserConfig } = useUserConfig()

  const [defaultPathEntryPickerShow, setDefaultPathEnteryPickerShow] = useState(false)

  return (
    <>
      <div className="mt-2 mx-auto max-w-lg">
        <Form
          labelPosition={touchMode ? 'top' : 'left'}
          labelAlign={touchMode ? 'left': 'right'}
          labelWidth={200}
        >
          <Form.Select
            field="language"
            label={t`label.language`}
            className="w-full"
            optionList={languageList.map(({ key, name }) => ({ label: name, value: key }))}
            initValue={language}
            onChange={(key) => setLanguage(key as any as string)}
          />
          <Form.Slot label={t`label.hotkeyStyle`}>
            <div className="flex">
              <div className="flex-grow">
                <RadioGroup
                  type="button"
                  value={userConfig.hotkeyStyle}
                  onChange={(e) => setUserConfig({ ...userConfig, hotkeyStyle: e.target.value })}
                >
                  <Radio value={HotkeyStyle.mac}>
                    <div className="-mx-1 flex items-center">
                      <SvgIcon.Apple size={12} /><span className="ml-1">Mac</span>
                    </div>
                  </Radio>
                  <Radio value={HotkeyStyle.win}>
                    <div className="-mx-1 flex items-center">
                      <SvgIcon.Windows size={12} /><span className="ml-1">Win</span>
                    </div>
                  </Radio>
                </RadioGroup>
              </div>
              <Button
                type="tertiary"
                onClick={() => window.open('https://gagu.io/docs/getting-started/hotkeys')}
              >
                <SvgIcon.Keyboard />
              </Button>
            </div>
          </Form.Slot>
          <Form.RadioGroup
            field="kiloSize"
            label="1K ="
            type="button"
            initValue={userConfig.kiloSize}
            onChange={(e) => setUserConfig({ ...userConfig, kiloSize: e.target.value })}
          >
            <Radio value={1000}>1000</Radio>
            <Radio value={1024}>1024</Radio>
          </Form.RadioGroup>
          <Form.RadioGroup
            field="colorScheme"
            label={t`label.colorScheme`}
            type="button"
            initValue={userConfig.colorScheme}
            onChange={(e) => setUserConfig({ ...userConfig, colorScheme: e.target.value })}
          >
            <Radio value={ColorScheme.auto}>{t(`label.colorScheme_${ColorScheme.auto}`)}</Radio>
            <Radio value={ColorScheme.light}>{t(`label.colorScheme_${ColorScheme.light}`)}</Radio>
            <Radio value={ColorScheme.dark}>{t(`label.colorScheme_${ColorScheme.dark}`)}</Radio>
          </Form.RadioGroup>

          <Divider margin="12px" align="left" className="pt-4">
            <div className="px-2 flex items-center">
              <div
                className="gagu-app-icon w-5 h-5"
                data-app-id={AppId.fileExplorer}
              />
              <span className="ml-2">{t`app.file-explorer`}</span>
            </div>
          </Divider>

          <Form.Switch
            field="fileExplorerAutoOpen"
            label={t`label.fileExplorerAutoOpen`}
            extraText={t`hint.fileExplorerAutoOpen_extra`}
            initValue={userConfig.fileExplorerAutoOpen}
            onChange={(fileExplorerAutoOpen) => setUserConfig({ ...userConfig, fileExplorerAutoOpen })}
          />
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
                onClick={() => setDefaultPathEnteryPickerShow(true)}
              >
                <SvgIcon.FolderOpen />
              </Button>
            </div>
          </Form.Slot>
        </Form>
      </div>

      <EntryPicker
        show={defaultPathEntryPickerShow}
        appId={AppId.settings}
        mode={EntryPickerMode.open}
        type={EntryType.directory}
        title={t`action.open`}
        onConfirm={({ pickedPath }) => {
          setUserConfig({ ...userConfig, fileExplorerDefaultPath: pickedPath })
          setDefaultPathEnteryPickerShow(false)
        }}
        onCancel={() => setDefaultPathEnteryPickerShow(false)}
      />
    </>
  )
}
