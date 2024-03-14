import { Button, SideSheet } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { AuthApi } from '../api'
import { useRequest } from '../hooks'
import { IAuthRecord } from '../types'
import { getDateTime, UserInfoStore } from '../utils'
import { Confirmor, EmptyPanel, SvgIcon } from './common'

interface LoginManagementPanelProps {
  show: boolean
  onClose: () => void
}

export function LoginManagementPanel(props: LoginManagementPanelProps) {

  const { show, onClose } = props

  const { t } = useTranslation()

  const { request: queryRecordList, response } = useRequest(AuthApi.queryRecordList)
  const { request: deleteRecord } = useRequest(AuthApi.deleteRecord)

  const { recordList, activeToken } = useMemo(() => {
    const recordList = response?.data || []
    const activeToken = UserInfoStore.getToken()
    return { recordList, activeToken }
  }, [response])

  useEffect(() => {
    show && queryRecordList()
  }, [show, queryRecordList])

  const handleDeleteClick = useCallback((token: string) => {
    Confirmor({
      type: 'delete',
      content: t`tip.sureToDelete`,
      onConfirm: async close => {
        const { success } = await deleteRecord(token)
        if (success) {
          toast.success('OK')
          queryRecordList()
        }
        close()
      },
    })
  }, [deleteRecord, queryRecordList, t])

  return (
    <>
      <SideSheet
        className="gagu-side-drawer gagu-sync-popstate-overlay gagu-prevent-hotkeys-overlay"
        title={(
          <div className="flex justify-between">
            <div>{t`title.loginManagement`}</div>
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
          <EmptyPanel dark show={!recordList.length} />

          <div>
            {recordList.map((record: IAuthRecord) => {
              const { token, loginAt, pulsedAt, ua, ip  } = record
              return (
                <div
                  key={token}
                  className="px-4 py-2 flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center">
                      {token === activeToken && (
                        <div className="mr-2 p-1 rounded-full bg-blue-500 text-white text-xs">
                          <SvgIcon.Focus size={12} />
                        </div>
                      )}
                      <div className="font-bold dark:text-zinc-100 text-lg">{ip}</div>
                      <div className="ml-3 text-xs text-gray-600 dark:text-zinc-300 flex items-center">
                        <SvgIcon.Login />
                        <span className="ml-1">{getDateTime(loginAt)}</span>
                        <SvgIcon.Pulse className="ml-3" />
                        <span className="ml-1">{getDateTime(pulsedAt)}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs">{ua}</div>
                  </div>
                  <div>
                    <Button
                      size="small"
                      className="ml-2"
                      icon={<SvgIcon.Delete className="text-red-500" />}
                      onClick={() => handleDeleteClick(token)}
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
