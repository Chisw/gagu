import { Button, Modal } from '@douyinfe/semi-ui'
import { SvgIcon } from './SvgIcon'
import { t } from 'i18next'
import { getPopupContainer } from '../../utils'
import { ExistingStrategy, ExistingStrategyType } from '../../types'

interface ExistingConfirmorProps {
  count: number
  onConfirm: (strategy: ExistingStrategyType) => void
  onCancel?: () => void
}

export function ExistingConfirmor(props: ExistingConfirmorProps) {

  const {
    count,
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
          <SvgIcon.Warning size={36} className="text-gray-400" />
        </div>
        <div className="mt-2 text-base break-all text-center">
          {t('tip.existedEntries', { count })}
        </div>
      </>
    ),
    footer: (
      <div className="flex flex-wrap">
        <Button
          theme="solid"
          className="w-full"
          style={{ margin: 0, marginBottom: 10 }}
          onClick={() => {
            onConfirm(ExistingStrategy.keepBoth)
            confirmor.destroy()
          }}
        >
          {t`action.existingStrategy_keepBoth`}
        </Button>
        <Button
          className="w-full"
          style={{ margin: 0, marginBottom: 10 }}
          onClick={() => {
            onConfirm(ExistingStrategy.replace)
            confirmor.destroy()
          }}
        >
          {t`action.existingStrategy_replace`}
        </Button>
        <Button
          className="w-full"
          style={{ margin: 0, marginBottom: 10 }}
          onClick={() => {
            onConfirm(ExistingStrategy.skip)
            confirmor.destroy()
          }}
        >
          {t`action.existingStrategy_skip`}
        </Button>
        <Button
          className="gagu-sync-popstate-overlay-close-button w-full"
          style={{ margin: 0 }}
          onClick={() => {
            onCancel && onCancel()
            confirmor.destroy()
          }}
        >
          {t`action.cancel`}
        </Button>
      </div>
    ),
    cancelButtonProps: { theme: 'borderless' },
    okButtonProps: { theme: 'solid' },
  })
}
