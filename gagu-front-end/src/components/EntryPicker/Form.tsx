import { useTranslation } from 'react-i18next'
import { line } from '../../utils'
import { SvgIcon } from '../common'
import { Button } from '@douyinfe/semi-ui'

export interface FormProps {
  touchMode: boolean
  disabled: boolean
  isPickingPath: boolean
  pickedPath: string
  warningShow: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function Form(props: FormProps) {
  const {
    touchMode,
    disabled,
    isPickingPath,
    pickedPath,
    warningShow,
    onCancel,
    onConfirm,
  } = props

  const { t } = useTranslation()

  return (
    <div>
      {isPickingPath && (
        <div
          className={line(`
            p-2 bg-gray-100 rounded flex items-center border border-gray-200
            dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-600
            ${touchMode ? 'mb-1 text-xs' : 'mb-2'}
          `)}
        >
          <SvgIcon.Folder className="flex-shrink-0" />
          <div className="flex-grow ml-1 break-all text-left">{pickedPath}</div>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div className="w-1/2">

        </div>
        <div className="flex-shrink-0">
          <Button
            className="gagu-sync-popstate-overlay-close-button"
            style={{ margin: 0 }}
            onClick={() => onCancel()}
          >
            {t`action.cancel`}
          </Button>
          <Button
            theme="solid"
            className={`ml-1 md:ml-2 ${touchMode ? 'w-24' : 'w-32'}`}
            disabled={disabled}
            onClick={onConfirm}
          >
            <div className="flex items-center">
              <div className={`transition-all duration-200 overflow-hidden ${warningShow ? 'w-5' : 'w-0'}`}>
                <SvgIcon.Warning />
              </div>
              <span>{t`action.open`}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
