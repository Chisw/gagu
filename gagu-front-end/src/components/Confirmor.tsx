import { Button, Modal } from '@douyinfe/semi-ui'
import { ReactNode } from 'react'

export interface ConfirmorProps {
  show: boolean
  icon?: ReactNode
  content?: ReactNode
  cancelText?: string
  confirmText?: string
  confirmLoading?: boolean
  onCancel?: () => void
  onConfirm?: () => void
}

export default function Confirmor(props: ConfirmorProps) {

  const {
    show,
    icon = '',
    content = '',
    cancelText = '取消',
    confirmText = '确定',
    confirmLoading = false,
    onCancel = () => { },
    onConfirm = () => { },
  } = props

  return (
    <>
      <Modal
        centered
        maskClosable
        closable={false}
        width={300}
        className="gg-confirmor"
        visible={show}
        onCancel={onCancel}
        footer={(
          <div className="flex">
            <Button
              className="w-full"
              onClick={onCancel}
            >
              {cancelText}
            </Button>
            <Button
              theme="solid"
              className="w-full"
              loading={confirmLoading}
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
        )}
      >
        {icon && (
          <div className="p-4 flex justify-center">
            {icon}
          </div>
        )}
        <div className="mt-2 text-base break-all text-center">
          {content}
        </div>
      </Modal>
    </>
  )
}
