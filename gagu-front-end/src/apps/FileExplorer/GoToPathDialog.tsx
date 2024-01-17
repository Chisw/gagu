import { Button, Input, Modal } from '@douyinfe/semi-ui'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useState } from 'react'
import { useRequest, useTouchMode } from '../../hooks'
import { FsApi } from '../../api'
import toast from 'react-hot-toast'
import { getPopupContainer } from '../../utils'

interface GoToPathDialogProps {
  show: boolean
  currentPath: string
  onGo: (path: string) => void
  onCancel: () => void
}

export default function GoToPathDialog(props: GoToPathDialogProps) {
  const {
    show,
    currentPath,
    onGo,
    onCancel,
  } = props

  const { t } = useTranslation()

  const isTouchMode = useTouchMode()

  const [path, setPath] = useState('')

  const { request: queryExists, loading } = useRequest(FsApi.queryExists)

  const handleGoConfirm = useCallback(async () => {
    const { data } = await queryExists(path)
    if (data === true) {
      onGo(path)
    } else if (data === false) {
      toast.error(t`tip.pathNotExists`)
    }
  }, [onGo, path, queryExists, t])

  useEffect(() => {
    if (show && currentPath) {
      setPath(currentPath)
      setTimeout(() => document.getElementById('gagu-go-to-path-input')?.focus())
    }
  }, [currentPath, show])

  return (
    <>
      <Modal
        centered={!isTouchMode}
        closable={false}
        maskClosable={false}
        visible={show}
        width={520}
        bodyStyle={{ position: 'relative', padding: 0 }}
        maskStyle={{ borderRadius: 4 }}
        className="gagu-use-form-dialog"
        style={{ borderRadius: 10, maxWidth: '90%' }}
        getPopupContainer={getPopupContainer}
        onCancel={onCancel}
        title={undefined}
        footer={(
          <div className="flex">
            <Button
              size={isTouchMode ? 'large' : 'default'}
              className="w-full"
              style={{ margin: 0 }}
              onClick={onCancel}
            >
              {t`action.cancel`}
            </Button>
            <Button
              theme="solid"
              size={isTouchMode ? 'large' : 'default'}
              className="w-full"
              disabled={!path || path === currentPath}
              loading={loading}
              onClick={handleGoConfirm}
            >
              {t`action.confirm`}
            </Button>
          </div>
        )}
      >
        <div className="-mb-4 md:-mb-8">
          <div className="text-center text-lg font-bold">
            {t`action.goTo`}
          </div>
          <div className="mt-4">
            <Input
              id="gagu-go-to-path-input"
              size={isTouchMode ? 'large' : 'default'}
              inputStyle={{ fontSize: 14 }}
              placeholder={t`hint.input`}
              value={path}
              onChange={setPath}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleGoConfirm()
                }
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  )
}
