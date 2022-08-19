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
    <>
      {isOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-white-700 backdrop-filter backdrop-blur-sm">
          <div
            // usePortal={false}
            // canEscapeKeyClose={canEscapeKeyClose}
            // canOutsideClickClose={canOutsideClickClose}
            className="w-72 max-w-full bg-white shadow-xl border p-4 select-none"
            // onClose={onCancel}
          >
            <div className="pb-4">
              {content || children}
            </div>
            <div className="flex -mx-1">
              <button
                className="mx-1 w-full"
                onClick={onCancel}
              >
                {cancelText}
              </button>
              <button
                className="mx-1 w-full bg-blue-500 text-white"
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
