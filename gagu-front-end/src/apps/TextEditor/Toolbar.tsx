import { useTranslation } from 'react-i18next'
import { SvgIcon, ToolButton } from '../../components/common'
import { IEntry } from '../../types'
import { copy, line } from '../../utils'
import toast from 'react-hot-toast'
import { MarkdownViewType } from './MarkdownView'

interface ToolbarProps {
  activeEntry?: IEntry
  textContent: string
  textContentCache: string
  textEditorFontSize: number
  monoMode: boolean
  setMonoMode: (mode: boolean) => void
  isSaveDisabled: boolean
  saving: boolean
  markdownView: MarkdownViewType
  onSave: () => void
  onReset: () => void
  onFontSizeChange: (step: number) => void
  onDownlaod: () => void
  onMarkdownViewChange: () => void
}

export default function Toolbar(props: ToolbarProps) {

  const {
    activeEntry,
    textContent,
    textContentCache,
    textEditorFontSize,
    monoMode,
    setMonoMode,
    isSaveDisabled,
    markdownView,
    saving,
    onSave,
    onReset,
    onFontSizeChange,
    onDownlaod,
    onMarkdownViewChange,
  } = props

  const { t } = useTranslation()

  return (
    <div
      className={line(`
        relative z-10 h-10 md:h-8 border-b bg-white select-none
        flex-shrink-0 flex items-center
        dark:bg-zinc-800 dark:border-zinc-600
        ${activeEntry ? '' : 'hidden'}
      `)}
    >
      <ToolButton
        title={t`action.save`}
        icon={<SvgIcon.Save />}
        disabled={isSaveDisabled}
        loading={saving}
        onClick={onSave}
      />
      <ToolButton
        title={t`action.reset`}
        icon={<SvgIcon.Restart />}
        disabled={textContent === textContentCache}
        onClick={onReset}
      />
      <ToolButton
        title={t`action.copy`}
        icon={<SvgIcon.Copy />}
        disabled={!activeEntry}
        onClick={() => {
          copy(textContent)
          toast.success('OK')
        }}
      />
      <ToolButton
        title={t`action.fontSizeReduce`}
        icon={<SvgIcon.FontSmall />}
        disabled={textEditorFontSize <= 12}
        onClick={() => onFontSizeChange(-1)}
      />
      <ToolButton
        title={t`action.fontSizeIncrease`}
        icon={<SvgIcon.FontLarge />}
        disabled={textEditorFontSize >= 36}
        onClick={() => onFontSizeChange(1)}
      />
      <ToolButton
        title={t`action.download`}
        icon={<SvgIcon.Download />}
        disabled={!textContent}
        onClick={onDownlaod}
      />
      <div className="flex-grow" />
      <ToolButton
        title={t`action.codeView`}
        icon={<SvgIcon.CodeView />}
        disabled={!activeEntry}
        active={monoMode}
        onClick={() => setMonoMode(!monoMode)}
      />
      <ToolButton
        title={t`action.markdownView`}
        icon={markdownView === 'FULL'
          ? <SvgIcon.MarkdownSolid />
          : <SvgIcon.Markdown />
        }
        active={['HALF', 'FULL'].includes(markdownView)}
        onClick={onMarkdownViewChange}
      />
    </div>
  )
}
