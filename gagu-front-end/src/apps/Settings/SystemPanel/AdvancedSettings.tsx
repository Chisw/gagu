import { Button, Form, Modal } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { SettingApi } from '../../../api'
import { useRequest, useTouchMode } from '../../../hooks'
import { SettingForm } from '../../../types'
import { Confirmor, Spinner, SvgIcon } from '../../../components/common'
import { useRecoilState } from 'recoil'
import { baseDataState } from '../../../states'

export default function AdvancedSettings() {

  const { t } = useTranslation()

  const [baseData] = useRecoilState(baseDataState)

  const touchMode = useTouchMode()

  const [form, setForm] = useState<SettingForm | null>(null)
  const [formCache, setFormCache] = useState<SettingForm | null>(null)

  const { request: querySettingAll, loading } = useRequest(SettingApi.querySettingAll)
  const { request: updateSetting, loading: updating } = useRequest(SettingApi.updateSetting)
  const { request: queryLatestVersion, loading: getting } = useRequest(SettingApi.queryLatestVersion)
  const { request: updateVersion } = useRequest(SettingApi.updateVersion)

  const handleQuerySettingAll = useCallback(async () => {
    const { success, data } = await querySettingAll()
    if (success) {
      const settingForm = new SettingForm(data)
      setForm(settingForm)
      setFormCache(settingForm)
    }
  }, [querySettingAll])

  useEffect(() => {
    handleQuerySettingAll()
  }, [handleQuerySettingAll])

  const disabled = useMemo(() => {
    return JSON.stringify(form) === JSON.stringify(formCache)
  }, [form, formCache])

  const handleVersionCheck = useCallback(async () => {
    const { data: { date, version } } = await queryLatestVersion()
    const isNewest = baseData.version === version
    const content = isNewest
      ? t`tip.currentlyLatestVersion`
      : t('tip.currentlyNeedsUpdating', { date, version })

    Confirmor({
      type: isNewest ? 'tip' : 'upgrade',
      content,
      onConfirm: async (close) => {
        close()

        if (!isNewest) {
          const confirm = Modal.confirm({
            centered: true,
            closable: false,
            maskClosable: false,
            hasCancel: false,
            width: 480,
            icon: undefined,
            content: (
              <div className="relative pt-6 flex flex-col justify-center items-center">
                <SvgIcon.Upgrade size={240} className="absolute z-0 top-0 left-0 -translate-x-1/3 -translate-y-1/3 text-gray-100" />
                <p className="relative z-10 mt-4 text-center font-bold">
                  {t`tip.upgrading`}
                </p>
                <p className="relative z-10 mt-6 px-3 py-1 text-center text-gray-400 border-2 bg-gray-800 border-gray-900 rounded flex items-center">
                  <code>npm i -g gagu</code>
                  <Spinner className="ml-6" />
                </p>
              </div>
            ),
            footer: <></>,
          })
          await updateVersion()
          confirm.destroy()
          
          Confirmor({
            type: 'ok',
            content: t`tip.upgraded`,
            onConfirm(close) {
              close()
              window.open('', '_self')?.close()
            },
          })
        }  
      },
    })
  }, [queryLatestVersion, baseData.version, t, updateVersion])

  const handleSubmit = useCallback(async () => {
    if (!form) return
    const { success } = await updateSetting(form)
    if (success) {
      toast.success('OK')
      handleQuerySettingAll()
    }
  }, [updateSetting, form, handleQuerySettingAll])

  return (
    <>
      <div className="max-w-lg">
        {(!loading && form) && (
          <Form
            labelPosition={touchMode ? 'top' : 'left'}
            labelAlign={touchMode ? 'left': 'right'}
            labelWidth={200}
            initValues={form}
            onSubmit={() => handleSubmit()}
          >
            <Form.Slot label={t`label.currentVersion`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span>v{ baseData.version }</span>
                  <a
                    href="https://github.com/Chisw/gagu/issues"
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 flex items-center text-sm text-blue-500 hover:text-blue-600"
                  >
                    <span>{t`action.feedback`}</span>
                    <SvgIcon.Feedback size={12} className="-translate-y-1" />
                  </a>
                </div>
                <Button
                  loading={getting}
                  onClick={handleVersionCheck}
                >
                  <SvgIcon.Refresh className="text-blue-500" />
                </Button>
              </div>
            </Form.Slot>
            <Form.Input
              showClear
              field="deviceName"
              label={t`label.deviceName`}
              placeholder="Device name"
              autoComplete="off"
              maxLength={32}
              suffix={<span className="pr-1 text-xs font-din text-gray-500">{form.deviceName.length}/32</span>}
              onChange={value => setForm({ ...form, deviceName: value })}
            />
            <Form.Input
              showClear
              field="host"
              label={t`label.serviceHost`}
              placeholder="127.0.0.1"
              autoComplete="off"
              maxLength={15}
              suffix={<span className="pr-1 text-xs font-din text-gray-500">{form.host.length}/15</span>}
              onChange={value => setForm({ ...form, host: value.trim() })}
              rules={[
                {
                  validator(rule, value, callback, source, options) {
                    if (value) {
                      return /((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/.test(value)
                    } else {
                      return true
                    }
                  },
                  message: t`hint.invalid`,
                },
              ]}
            />
            <Form.Input
              showClear
              field="port"
              label={t`label.servicePort`}
              placeholder="9293"
              autoComplete="off"
              maxLength={5}
              suffix={<span className="pr-1 text-xs font-din text-gray-500">{form.port.length}/5</span>}
              onChange={value => setForm({ ...form, port: value.trim() })}
              rules={[
                {
                  validator(rule, value, callback, source, options) {
                    if (value) {
                      return /^\d{2,5}$/.test(value)
                    } else {
                      return true
                    }
                  },
                  message: t`hint.invalid`,
                },
              ]}
            />
            <div className="pt-2 flex justify-end">
              <Button
                theme="solid"
                type="primary"
                htmlType="submit"
                className="w-32"
                loading={updating}
                children={t`action.save`}
                disabled={disabled}
              />
            </div>
          </Form>
        )}
      </div>
    </>
  )
}
