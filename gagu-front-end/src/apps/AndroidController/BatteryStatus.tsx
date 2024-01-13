import { useEffect, useMemo } from 'react'
import { Button, Descriptions } from '@douyinfe/semi-ui'
import { SvgIcon } from '../../components/common'
import { useRequest } from '../../hooks'
import { TermuxApi } from '../../api'

export default function BatteryStatus() {

  const { request: queryBatteryStatus, loading, response: batteryStatusResponse } = useRequest(TermuxApi.queryBatteryStatus)

  const data = useMemo(() => {
    const {
      health,
      percentage,
      plugged,
      status,
      temperature,
    } = batteryStatusResponse?.data || {}

    return [
      { key: 'health', value: health || '--' },
      { key: 'percentage', value: percentage ? percentage + '%' : '--' },
      { key: 'plugged', value: plugged || '--' },
      { key: 'status', value: status || '--'},
      { key: 'temperature', value: temperature ? temperature.toFixed(1) + '℃' : '--' },
    ]

  }, [batteryStatusResponse?.data])

  useEffect(() => {
    queryBatteryStatus()
  }, [queryBatteryStatus])

  return (
    <>
      <div className="relative">
        <Button
          icon={<SvgIcon.Refresh />}
          className="absolute top-0 right-0"
          loading={loading}
          onClick={queryBatteryStatus}
        />
        <Descriptions
          align="left"
          data={data}
        />
      </div>
    </>
  )
}
