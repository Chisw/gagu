import { Button, SideSheet } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { TunnelApi } from '../api'
import { useRequest } from '../hooks'
import { ITunnel } from '../types'
import { getDateTime } from '../utils'
import { Confirmor, EmptyPanel, SvgIcon } from './common'

interface MySharingPanelProps {
  show: boolean
  onClose: () => void
}

export function MySharingPanel(props: MySharingPanelProps) {

  const { show, onClose } = props

  const { t } = useTranslation()

  const { request: queryTunnelList, response } = useRequest(TunnelApi.queryTunnelList)
  const { request: deleteTunnel } = useRequest(TunnelApi.deleteTunnel)

  const tunnelList = useMemo(() => response?.data || [], [response])

  useEffect(() => {
    show && queryTunnelList()
  }, [show, queryTunnelList])

  const handleDeleteClick = useCallback((code: string) => {
    Confirmor({
      type: 'delete',
      content: t`tip.sureToDelete`,
      onConfirm: async close => {
        const { success } = await deleteTunnel(code)
        if (success) {
          toast.success('OK')
          queryTunnelList()
        }
        close()
      },
    })
  }, [deleteTunnel, queryTunnelList, t])

  return (
    <>
      <SideSheet
        className="gagu-side-drawer gagu-sync-popstate-overlay gagu-prevent-hotkeys-overlay"
        title={(
          <div className="flex justify-between">
            <div>{t`title.mySharing`}</div>
            <Button
              type="danger"
              size="small"
              icon={<SvgIcon.Close />}
              className="gagu-sync-popstate-overlay-close-button"
              onClick={onClose}
            />
          </div>
        )}
        closable={false}
        placement="left"
        headerStyle={{ padding: '8px 12px' }}
        bodyStyle={{ padding: 0 }}
        maskStyle={{ background: 'rgba(0, 0, 0, .1)' }}
        width={600}
        visible={show}
        onCancel={onClose}
      >
        <div className="relative w-full h-full overflow-y-auto">
          <EmptyPanel dark show={!tunnelList.length} />

          <div>
            {tunnelList.map((tunnel: ITunnel) => {
              const { code, createdAt, downloadName, expiredAt, leftTimes } = tunnel
              return (
                <div
                  key={code}
                  className="px-4 py-2 flex justify-between items-center group"
                >
                  <div>
                    <div className="font-bold dark:text-zinc-100">{downloadName}</div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-zinc-300">
                      {getDateTime(createdAt)}
                      &emsp;
                      {leftTimes === undefined ? t`tip.noTimesLimit` : leftTimes}
                      &emsp;
                      {expiredAt
                        ? t('tip.validUntil', { time: getDateTime(expiredAt).slice(0, -3) })
                        : t`tip.noTimeLimit`
                      }
                    </div>
                  </div>
                  <div>
                    <Button
                      size="small"
                      className="ml-2"
                      icon={<SvgIcon.ExternalLink className="text-blue-500" />}
                      onClick={() => window.open(`/sharing/${code}`)}
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
