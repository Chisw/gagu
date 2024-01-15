import { Button, Descriptions, Radio, RadioGroup } from '@douyinfe/semi-ui'
import { useRequest } from '../../hooks'
import { TermuxApi } from '../../api'
import { useCallback, useState } from 'react'
import { ILocationForm } from '../../types'
import { SvgIcon } from '../../components/common'
import { getBaiduMapLocationUrl } from '../../utils'

export default function Location() {

  const [form, setForm] = useState<ILocationForm>({ provider: 'gps', request: 'once' })

  const { request: queryLocation, loading, response } = useRequest(TermuxApi.queryLocation)

  const handleQuery = useCallback(() => {
    queryLocation(form)
  }, [form, queryLocation])

  return (
    <>
      <div className="relative h-64 overflow-y-auto">
        <div>Provider:</div>
        <RadioGroup
          value={form.provider}
          onChange={(e) => setForm({ ...form, provider: e.target.value })}
        >
          {(['gps', 'network', 'passive']).map((key) => (
            <Radio
              key={key}
              value={key}
              children={key}
            />
          ))}
        </RadioGroup>
        <div>Request:</div>
        <RadioGroup
          value={form.request}
          onChange={(e) => setForm({ ...form, request: e.target.value })}
        >
          {(['once', 'last', 'updates']).map((key) => (
            <Radio
              key={key}
              value={key}
              children={key}
            />
          ))}
        </RadioGroup>
        <Button
          icon={<SvgIcon.Refresh />}
          className="absolute top-0 right-0"
          loading={loading}
          onClick={handleQuery}
        />
        {(response?.data?.longitude && response?.data?.latitude) && (
          <div>
            <Button
              icon={<SvgIcon.Pin />}
              onClick={() => window.open(getBaiduMapLocationUrl(response?.data?.longitude as any as number, response?.data?.latitude as any as number))}
            />
          </div>
        )}

        <div className="mt-2">
          <Descriptions
            data={Object.entries(response?.data || {}).map(([key, value]) => ({ key, value: String(value) }))}
          />
        </div>
      </div>
    </>
  )
}
