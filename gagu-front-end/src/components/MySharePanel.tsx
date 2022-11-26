import { SideSheet } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { TunnelApi } from '../api'
import { useFetch } from '../hooks'
import { ITunnel } from '../types'
import { getDateTime } from '../utils'
import { SvgIcon } from './base'
import { IconButton } from './base/IconButton'

export default function MySharePanel() {

  const [visible, setVisible] = useState(true)

  const { fetch: getTunnels, data } = useFetch(TunnelApi.getTunnels)
  const { fetch: deleteTunnel } = useFetch(TunnelApi.deleteTunnel)

  useEffect(() => {
    getTunnels()
  }, [getTunnels])

  const handleDelete = useCallback(async (code: string) => {
    const res = await deleteTunnel(code)
    if (res?.success) {
      toast.success('删除成功')
      getTunnels()
    }
  }, [deleteTunnel, getTunnels])

  return (
    <>
      <SideSheet
        title="我的分享"
        closable={false}
        placement="left"
        headerStyle={{ padding: '8px 20px', borderBottom: '1px solid #efefef' }}
        maskStyle={{ background: 'rgba(0, 0, 0, .1)' }}
        width={600}
        visible={visible}
        onCancel={() => setVisible(false)}
      >
        <div>
          <div>
            {data?.tunnels.map((tunnel: ITunnel) => {
              const { code, createdAt, downloadName, entryList, expiredAt, leftTimes, password } = tunnel
              return (
                <div
                  key={code}
                  className="mt-4 flex justify-between items-center group"
                >
                  <div>
                    <div className="font-bold">{downloadName}</div>
                    <div className="text-xs text-gray-400">
                      {getDateTime(createdAt)}
                    </div>
                  </div>
                  <div>
                    <IconButton
                      icon={<SvgIcon.ExternalLink className="text-blue-500" />}
                      onClick={() => window.open(`/share/${code}`)}
                    />
                    <IconButton
                      icon={<SvgIcon.Delete className="text-red-500" />}
                      onClick={() => handleDelete(code)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </SideSheet>
    </>
  )
}
