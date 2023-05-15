import { Button, SideSheet } from '@douyinfe/semi-ui'
import { useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { TunnelApi } from '../api'
import { useRequest } from '../hooks'
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

  const { t } = useTranslation()

  const { request: getTunnels, data } = useRequest(TunnelApi.getTunnels)
  const { request: deleteTunnel } = useRequest(TunnelApi.deleteTunnel)

  useEffect(() => {
    if (visible) {
      getTunnels()
    }
  }, [visible, getTunnels])

  const handleDeleteClick = useCallback((code: string) => {
    Confirmor({
      type: 'delete',
      content: t`tip.sureToDelete`,
      t,
      onConfirm: async close => {
        const { success } = await deleteTunnel(code)
        if (success) {
          toast.success('OK')
          getTunnels()
        }
        close()
      },
    })
  }, [deleteTunnel, getTunnels, t])

  return (
    <>
      <SideSheet
        title={(
          <div className="flex justify-between">
            <div>{t`title.mySharing`}</div>
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
              <div className="py-20 flex justify-center text-gray-100">
                <SvgIcon.G size={64} />
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
                      &emsp;
                      {leftTimes === undefined ? t`tip.noTimesLimit` : leftTimes}
                      &emsp;
                      {expiredAt
                        ? `有效期至 ${t('tip.validUntil', { time: getDateTime(expiredAt).slice(0, -3) })}`
                        : t`tip.noTimeLimit`
                      }
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
