import { AndroidApi } from '../../api'
import { useRequest } from '../../hooks'
import { Button } from '@douyinfe/semi-ui'
import { SvgIcon } from '../../components/common'

export default function CallLog() {
  const { request: queryCallLog, loading, data: callLogData } = useRequest(AndroidApi.queryCallLog)

  // useEffect(() => {
  //   queryCallLog()
  // }, [queryCallLog])

  return (
    <>
      <div className="relative h-64 overflow-y-auto">
        <Button
          icon={<SvgIcon.Refresh />}
          className="absolute top-0 right-0"
          loading={loading}
          onClick={queryCallLog}
        />
        <div>
          {JSON.stringify(callLogData?.data)}
        </div>
      </div>
    </>
  )
}
