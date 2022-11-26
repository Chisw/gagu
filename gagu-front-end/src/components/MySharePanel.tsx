import { Button, SideSheet } from '@douyinfe/semi-ui'
import { useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import { TunnelApi } from '../api'
import { useFetch } from '../hooks'
import { ITunnel } from '../types'
import { getDateTime } from '../utils'
import { SvgIcon } from './base'
import { Confirmor } from './base'

interface MySharePanelProps {
  visible: boolean
  onClose: () => void
}

export default function MySharePanel(props: MySharePanelProps) {

  const { visible, onClose } = props

  const { fetch: getTunnels, data } = useFetch(TunnelApi.getTunnels)
  const { fetch: deleteTunnel } = useFetch(TunnelApi.deleteTunnel)

  useEffect(() => {
    if (visible) {
      getTunnels()
    }
  }, [visible, getTunnels])

  const handleDeleteClick = useCallback((code: string) => {
    Confirmor({
      type: 'delete',
      content: '确定要删除分享吗？',
      onConfirm: async close => {
        const res = await deleteTunnel(code)
        if (res?.success) {
          toast.success('删除成功')
          getTunnels()
        }
        close()
      },
    })
  }, [deleteTunnel, getTunnels])

  return (
    <>
      <SideSheet
        title={(
          <div className="flex justify-between">
            <div>我的分享</div>
            <Button
              type="danger"
              size="small"
              icon={<SvgIcon.Close />}
              onClick={onClose}
            />
          </div>
        )}
        closable={false}
        placement="left"
        headerStyle={{ padding: '8px 24px', borderBottom: '1px solid #efefef' }}
        maskStyle={{ background: 'rgba(0, 0, 0, .1)' }}
        width={600}
        visible={visible}
        onCancel={onClose}
      >
        <div>
          <div>
            {!data?.tunnels.length && (
              <div className="py-10 text-center text-gray-400">
                空空如也
              </div>
            )}
          </div>
          <div>
            {data?.tunnels.map((tunnel: ITunnel) => {
              const { code, createdAt, downloadName, expiredAt, leftTimes } = tunnel
              return (
                <div
                  key={code}
                  className="mt-4 flex justify-between items-center group"
                >
                  <div>
                    <div className="font-bold">{downloadName}</div>
                    <div className="mt-1 text-xs text-gray-400">
                      {getDateTime(createdAt)}
                      &emsp;{leftTimes === undefined ? '无限次' : leftTimes}
                      &emsp;{expiredAt ? `有效期至 ${getDateTime(expiredAt).slice(0, -3)}` : '无限期'}
                    </div>
                  </div>
                  <div>
                    <Button
                      size="small"
                      className="ml-2"
                      icon={<SvgIcon.ExternalLink className="text-blue-500" />}
                      onClick={() => window.open(`/share/${code}`)}
                    />
                    <Button
                      size="small"
                      className="ml-2"
                      icon={<SvgIcon.Delete className="text-red-500" />}
                      onClick={() => handleDeleteClick(code)}
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
