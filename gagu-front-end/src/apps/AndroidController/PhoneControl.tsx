import { TermuxApi } from '../../api'
import { useRequest } from '../../hooks'
import { Button } from '@douyinfe/semi-ui'
import { SvgIcon } from '../../components/common'
import { copy } from '../../utils'
import toast from 'react-hot-toast'

export default function PhoneControl() {
  const { request: queryCallLog, loading: queryingCallLog, response: callLogResponse } = useRequest(TermuxApi.queryCallLog)
  const { request: queryContactList, loading: queryingContactList, response: contactListResponse } = useRequest(TermuxApi.queryContactList)

  // useEffect(() => {
  //   queryCallLog()
  // }, [queryCallLog])

  return (
    <>
      <div className="relative h-64 overflow-y-auto">
        <Button
          icon={<SvgIcon.Refresh />}
          className="ab solute top-0 right-0"
          loading={queryingCallLog}
          onClick={queryCallLog}
        />
        <Button
          icon={<SvgIcon.Refresh />}
          className="ab solute top-0 right-0"
          loading={queryingContactList}
          onClick={queryContactList}
        />
        <div>
          {JSON.stringify(callLogResponse?.data)}
        </div>
        <div>
          {(contactListResponse?.data || []).map(({ name, number }, contactIndex) => (
            <div
              key={contactIndex}
              className="mb-3 flex items-center"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex justify-center items-center text-lg">
                {name[0]}
              </div>
              <div className="flex-grow ml-2">
                <div className="text-base font-bold">{name}</div>
                <div className="text-gray-500 text-xs">
                  {number.split('').map((s, i) => i > 2 && i < number.length - 4 ? '*' : s)}
                </div>
              </div>
              <div className="flex-shrink-0">
                <Button
                  size="small"
                  className="mx-1"
                  icon={<SvgIcon.Call />}
                />
                <Button
                  size="small"
                  className="mx-1"
                  icon={<SvgIcon.Copy />}
                  onClick={() => {
                    copy(`${name} - ${number}`)
                    toast.success('OK')
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
