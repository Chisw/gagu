import { Button, RadioGroup, Radio, Input } from '@douyinfe/semi-ui'
import { useCallback, useState } from 'react'
import { useRequest } from '../../hooks'
import { TermuxApi } from '../../api'
import toast from 'react-hot-toast'
import { SvgIcon } from '../../components/common'
import { IInfraredTransmitForm } from '../../types'

export default function InfraredControl() {

  const [form, setForm] = useState<IInfraredTransmitForm>({
    frequency: 0,
    pattern: '',
  })

  const { request: queryInfraredFrequencies, loading, response: infraredFrequenciesResponse } = useRequest(TermuxApi.queryInfraredFrequencies)
  const { request: createInfraredTransmit, loading: creating } = useRequest(TermuxApi.createInfraredTransmit)

  const handleQueryInfraredFrequencies = useCallback(async () => {
    await queryInfraredFrequencies()
  }, [queryInfraredFrequencies])

  const handleCreateInfraredTransmit = useCallback(async () => {
    const { success } = await createInfraredTransmit(form)
    if (success) {
      toast.success('OK')
    }
  }, [createInfraredTransmit, form])

  return (
    <>
      <div className="relative h-64 overflow-y-auto">
        <Button
          icon={<SvgIcon.Refresh />}
          className="absolute top-0 right-0"
          loading={loading}
          onClick={handleQueryInfraredFrequencies}
        />
        <div className="mt-2">
          <RadioGroup
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
          >
            {(infraredFrequenciesResponse?.data || []).map(({ min, max }, index) => (
              <Radio
                key={index}
                value={min}
                children={`${min}Hz`}
              />
            ))}
          </RadioGroup>
        </div>
        <div className="mt-2 flex items-center">
          <Input
            placeholder="Infrared pattern"
            value={form.pattern}
            onChange={(pattern) => setForm({ ...form, pattern })}
          />
          <Button
            className="ml-2 w-16"
            icon={<SvgIcon.RemoteControl />}
            loading={creating}
            onClick={handleCreateInfraredTransmit}
          />
        </div>
      </div>
    </>
  )
}
