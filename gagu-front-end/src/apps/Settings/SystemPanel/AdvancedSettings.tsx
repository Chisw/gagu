import { Button, Form } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { SettingApi } from '../../../api'
import { useRequest } from '../../../hooks'
import { ISetting, SettingForm } from '../../../types'

export default function AdvancedSettings() {

  const { t } = useTranslation()

  const [form, setForm] = useState<SettingForm>(new SettingForm())
  const [formCache, setFormCache] = useState<SettingForm>(new SettingForm())

  const { request: querySettingAll, loading: getting, data } = useRequest(SettingApi.querySettingAll)
  const { request: updateSetting, loading: updating } = useRequest(SettingApi.updateSetting)

  useEffect(() => {
    querySettingAll()
  }, [querySettingAll])

  useEffect(() => {
    if (data && data.settings) {
      const settingForm = new SettingForm(data.settings as ISetting)
      setForm(settingForm)
      setFormCache(settingForm)
    }
  }, [data])

  const disabled = useMemo(() => {
    return JSON.stringify(form) === JSON.stringify(formCache)
  }, [form, formCache])

  const handleSubmit = useCallback(async () => {
    const data: any = await updateSetting(form)
    if (data?.success) {
      toast.success('OK')
      querySettingAll()
    }
  }, [updateSetting, form, querySettingAll])

  return (
    <>
      <div className="mx-auto max-w-lg">
        {!getting && (
          <Form
            labelPosition="left"
            labelAlign="right"
            labelWidth={200}
            initValues={form}
            onSubmit={() => handleSubmit()}
          >
            <Form.Input
              showClear
              label={t`label.servicePort`}
              placeholder="9293 (default)"
              field="port"
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
                  message: 'Invalid'
                },
              ]}
            />
            <Form.Input
              showClear
              label={t`label.deviceName`}
              placeholder="Device name"
              field="deviceName"
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
