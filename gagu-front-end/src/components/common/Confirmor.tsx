import { Button, Modal } from '@douyinfe/semi-ui'
import { ReactNode } from 'react'
import { SvgIcon } from './SvgIcon'
import { t } from 'i18next'
import { getPopupContainer } from '../../utils'

interface ConfirmorProps {
  type: 'download' | 'delete' | 'tip' | 'favorite' | 'unfavorite' | 'upgrade' | 'ok' | 'move' | 'paste'
  content: ReactNode
  onConfirm: (close: () => void) => void
  onCancel?: (close: () => void) => void
}

const iconMap = {
  download: <SvgIcon.Download size={36} className="text-blue-600" />,
  delete: <SvgIcon.Delete size={36} className="text-red-600" />,
  tip: <SvgIcon.Warning size={36} className="text-gray-400" />,
  favorite: <SvgIcon.StarSolid size={36} className="text-yellow-500" />,
  unfavorite: <SvgIcon.Star size={36} className="text-gray-400" />,
  upgrade: <SvgIcon.Upgrade size={36} className="text-blue-600" />,
  ok: <SvgIcon.CheckCircle size={36} className="text-green-600" />,
  move: <SvgIcon.MoveTo size={36} className="text-blue-600" />,
  paste: <SvgIcon.Paste size={36} className="text-blue-600" />,
}

export function Confirmor(props: ConfirmorProps) {

  const {
    type,
    content,
    onConfirm,
    onCancel,
  } = props

  const confirmor = Modal.confirm({
    closable: false,
    centered: true,
    maskClosable: true,
    width: 300,
    maskStyle: { borderRadius: 4 },
    className: 'gagu-confirmor gagu-sync-popstate-overlay gagu-prevent-hotkeys-overlay',
    icon: undefined,
    getPopupContainer,
    content: (
      <>
        <div className="p-4 flex justify-center">
          {iconMap[type]}
        </div>
        <div className="mt-2 text-base break-all text-center">
          {content}
        </div>
      </>
    ),
    footer: (
      <div className="flex">
        <Button
          className="gagu-sync-popstate-overlay-close-button w-full"
          style={{ margin: 0 }}
          onClick={() => {
            if (onCancel) {
              onCancel(confirmor.destroy)
            } else {
              confirmor.destroy()
            }
          }}
        >
          {t`action.cancel`}
        </Button>
        <Button
          theme="solid"
          className="w-full"
          onClick={() => onConfirm(confirmor.destroy)}
        >
          {t`action.confirm`}
        </Button>
      </div>
    ),
    cancelButtonProps: { theme: 'borderless' },
    okButtonProps: { theme: 'solid' },
  })
}
