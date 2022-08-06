import { Button, Dialog } from '@blueprintjs/core'
import { ReactNode, useEffect } from 'react'

export interface ConfirmorProps {
  isOpen: boolean
  content?: ReactNode
  children?: ReactNode
  cancelText?: string
  confirmText?: string
  onCancel?: () => void
  onConfirm?: () => void
  canEscapeKeyClose?: boolean
  canOutsideClickClose?: boolean
}

export default function Confirmor(props: ConfirmorProps) {

  const {
    isOpen,
    content = '',
    children = undefined,
    cancelText = '取消',
    confirmText = '确定',
    onCancel = () => { },
    onConfirm = () => { },
    canEscapeKeyClose = true,
    canOutsideClickClose = true,
  } = props

  useEffect(() => {
    const listener = (e: any) => {
      const { key, shiftKey } = e
      if (key === 'Enter' && !shiftKey) onConfirm()
    }
    if (isOpen) {
      document.addEventListener('keyup', listener)
    } else {
      document.removeEventListener('keyup', listener)
    }
    return () => document.removeEventListener('keyup', listener)
  }, [isOpen, onConfirm])

  return (
    <Dialog
      usePortal={false}
      isOpen={isOpen}
      canEscapeKeyClose={canEscapeKeyClose}
      canOutsideClickClose={canOutsideClickClose}
      className="w-72 max-w-full bg-white shadow-xl border p-4 select-none"
      backdropClassName="bg-white-700 bg-hazy-10"
      onClose={onCancel}
    >
      <div className="pb-4">
        {content || children}
      </div>
      <div className="flex -mx-1">
        <Button
          className="mx-1 w-full"
          onClick={onCancel}
        >
          {cancelText}
        </Button>
        <Button
          intent="primary"
          className="mx-1 w-full"
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </Dialog>
  )
}