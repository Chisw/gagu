import { useEffect, useMemo } from 'react'
import { TermuxApi } from '../../api'
import { useRequest } from '../../hooks'
import { Button } from '@douyinfe/semi-ui'
import { SvgIcon } from '../../components/common'
import { line } from '../../utils'

export default function SMSList() {
  const { request: querySMSList, loading, response } = useRequest(TermuxApi.querySMSList)

  const list = useMemo(() => (response?.data || []).reverse(), [response])

  useEffect(() => {
    querySMSList()
  }, [querySMSList])

  return (
    <>
      <div className="relative h-72 overflow-y-auto">
        <Button
          icon={<SvgIcon.Refresh />}
          loading={loading}
          onClick={querySMSList}
        />
        <div className="pr-2">
          {list.map(({ _id, type, received, number, read, body }) => (
            <div
              key={_id}
              className="py-1"
            >
              <div
                className={line(`
                  mt-1 px-3 py-2 rounded-lg text-justify
                  ${type === 'inbox'
                    ? 'mr-12 bg-zinc-100 dark:bg-zinc-500'
                    : 'ml-12 bg-blue-600 text-white dark:bg-blue-700'
                  }
                `)}
              >
                <div className="flex justify-between font-din text-xs opacity-50">
                  <span>{number}</span>
                  <span>{received}</span>
                </div>
                <div className="mt-1">
                  {body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
