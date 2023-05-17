import { Button, Form } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { SettingApi } from '../../../api'
import { useRequest } from '../../../hooks'
import { SettingForm } from '../../../types'

export default function AdvancedSettings() {

  const { t } = useTranslation()

  const [form, setForm] = useState<SettingForm | null>(null)
  const [formCache, setFormCache] = useState<SettingForm | null>(null)

  const { request: querySettingAll, loading } = useRequest(SettingApi.querySettingAll)
  const { request: updateSetting, loading: updating } = useRequest(SettingApi.updateSetting)

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
      <div className="mx-auto max-w-lg">
        {(!loading && form) && (
          <Form
            labelPosition="left"
            labelAlign="right"
            labelWidth={200}
            initValues={form}
            onSubmit={() => handleSubmit()}
          >
            <Form.Input
              showClear
              field="port"
              label={t`label.servicePort`}
              placeholder="9293 (default)"
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
