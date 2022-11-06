import { Button, Form } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { SettingApi } from '../../../api'
import { useFetch } from '../../../hooks'
import { ISetting, SettingForm } from '../../../types'

export default function AdvancedSettings() {

  const [form, setForm] = useState<SettingForm>(new SettingForm())

  const { fetch: getAll, loading: getting, data } = useFetch(SettingApi.getAll)
  const { fetch: update, loading: updating } = useFetch(SettingApi.update)

  useEffect(() => {
    getAll()
  }, [getAll])

  useEffect(() => {
    if (data && data.settings) {
      setForm(new SettingForm(data.settings as ISetting))
    }
  }, [data])

  const handleSubmit = useCallback(async () => {
    const data: any = await update(form)
    if (data?.success) {
      toast.success('OK')
    }
  }, [update, form])

  return (
    <>
      <div>
        {!getting && (
          <Form
            initValues={form}
            onSubmit={() => handleSubmit()}
          >
            <Form.Input
              showClear
              label="服务端口号"
              placeholder="9293 (default)"
              field="port"
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
            <div className="abso lute bott om-0">
              <Button
                theme="solid"
                type="primary"
                htmlType="submit"
                className="w-32"
                loading={updating}
                children="保存"
              />
            </div>
          </Form>
        )}
      </div>
    </>
  )
}
