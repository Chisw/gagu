import { Button, Modal } from '@douyinfe/semi-ui'
import { ReactNode } from 'react'
import { SvgIcon } from './SvgIcon'

interface ConfirmorProps {
  type: 'download' | 'delete' | 'tip'
  content: ReactNode
  t: (key: string | TemplateStringsArray) => string
  onConfirm: (close: () => void) => void
}

const iconMap = {
  download: <SvgIcon.Download size={36} />,
  delete: <SvgIcon.Delete size={36} />,
  tip: <SvgIcon.Warning size={36} />,
}

export function Confirmor(props: ConfirmorProps) {

  const {
    type,
    content,
    t,
    onConfirm,
  } = props

  const confirm = Modal.confirm({
    closable: false,
    centered: true,
    maskClosable: true,
    width: 300,
    className: 'gagu-confirmor',
    icon: undefined,
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
          className="w-full"
          style={{ margin: 0 }}
          onClick={() => confirm.destroy()}
        >
          {t`action.cancel`}
        </Button>
        <Button
          theme="solid"
          className="w-full"
          onClick={() => onConfirm(confirm.destroy)}
        >
          {t`action.confirm`}
        </Button>
      </div>
    ),
    cancelButtonProps: { theme: 'borderless' },
    okButtonProps: { theme: 'solid' },
  });
}