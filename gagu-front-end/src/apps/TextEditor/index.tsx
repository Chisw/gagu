import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Confirmor, Opener, SvgIcon, ToolButton } from '../../components/common'
import { copy, ENTRY_ICON_LIST, getEntryPath, line } from '../../utils'
import { FsApi } from '../../api'
import { AppComponentProps, AppId, IEntry } from '../../types'
import { useRunAppEvent, useRequest, useHotKey, useUserConfig } from '../../hooks'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { useRecoilState } from 'recoil'
import { lastChangedDirectoryState } from '../../states'

const appId = AppId.textEditor

type MarkdownView = 'NONE' | 'HALF' | 'FULL'

export default function TextEditor(props: AppComponentProps) {

  const { isTopWindow, setWindowTitle } = props

  const { t } = useTranslation()

  const {
    // matchedEntryList,
    // activeIndex,
    activeEntry,
    // activeEntryStreamUrl,
    setActiveIndex,
  } = useRunAppEvent(appId)

  const [, setLastChangedDirectory] = useRecoilState(lastChangedDirectoryState)

  const {
    userConfig,
    setUserConfig,
    userConfig: {
      kiloSize,
      textEditorFontSize,
    },
  } = useUserConfig()

  const [value, setValue] = useState('')
  const [monoMode, setMonoMode] = useState(false)
  const [markdownView, setMarkdownView] = useState<MarkdownView>('NONE')

  const { request: queryTextContent, data, setData } = useRequest(FsApi.queryTextContent, {
    success: true,
    message: 'OK',
    data: '',
  })

  const { request: uploadFile, loading: saving } = useRequest(FsApi.uploadFile)

  const isMarkdown = useMemo(() => activeEntry?.extension === 'md', [activeEntry])
  const textContent = useMemo(() => data?.data || '', [data])
  const submitDisabled = useMemo(() => {
    return (value === textContent && !saving ) || !activeEntry
  }, [activeEntry, saving, textContent, value])

  useEffect(() => {
    if (isMarkdown) {
      setMarkdownView('HALF')
    } else {
      setMarkdownView('NONE')
    }
  }, [isMarkdown])

  const handleOpen = useCallback((entry: IEntry) => {
      const { name, extension } = entry
      queryTextContent(getEntryPath(entry))
      setWindowTitle(name)
      const isMono = ENTRY_ICON_LIST.filter(icon => ['code', 'data'].includes(icon.type))
        .some(icon => icon.matchList.includes(extension))
      if (isMono) {
        setMonoMode(true)
      }
  }, [queryTextContent, setWindowTitle])

  useEffect(() => {
    if (activeEntry) {
      const { size } = activeEntry
      if (size && size > (500 * kiloSize)) {
          Confirmor({
            type: 'tip',
            content: t('tip.sureToOpenTextFile', { size: '500KB' }),
            onConfirm: (close) => {
              handleOpen(activeEntry)
              close()
            },
            onCancel: (close) => {
              setActiveIndex(-1)
              close()
            },
          })
      } else {
        handleOpen(activeEntry)
      }
    }
  }, [t, activeEntry, handleOpen, setActiveIndex, kiloSize])

  useEffect(() => {
    setValue(typeof textContent === 'object' ? JSON.stringify(textContent) : textContent)
  }, [textContent])

  const handleSaveClick = useCallback(async () => {
    if (!activeEntry || submitDisabled) return
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' })
    const file = new File([blob], activeEntry.name)
    // TODO: use patch
    const { success } = await uploadFile(getEntryPath(activeEntry), file)
    if (success) {
      toast.success('OK')
      setData({ success: true, message: 'OK', data: value })
      setLastChangedDirectory({ path: activeEntry.parentPath, timestamp: Date.now() })
    }
  }, [activeEntry, submitDisabled, value, uploadFile, setData, setLastChangedDirectory])

  const handleResetClick = useCallback(() => {
    setValue(textContent)
  }, [textContent])

  const handleFontSizeChange = useCallback((step: number) => {
    const isOutOfRange = (step < 0 && textEditorFontSize <= 12) ||
      (step > 0 && textEditorFontSize >= 36)
    if (isOutOfRange) return
    const fontSize = textEditorFontSize + step
    setUserConfig({ ...userConfig, textEditorFontSize: fontSize })
  }, [setUserConfig, textEditorFontSize, userConfig])

  const handleMarkdownViewChange = useCallback((view?: MarkdownView) => {
    const targetView = view || {
      NONE: 'HALF',
      HALF: 'FULL',
      FULL: 'NONE',
    }[markdownView] as MarkdownView

    setMarkdownView(targetView)
  }, [markdownView])

  useHotKey({
    binding: isTopWindow,
    fnMap: {
      'Meta+KeyS, Ctrl+KeyS': handleSaveClick,
      'Meta+KeyR, Ctrl+KeyR': handleResetClick,
      'Meta+BracketLeft, Ctrl+BracketLeft': () => handleFontSizeChange(-1),
      'Meta+BracketRight, Ctrl+BracketRight': () => handleFontSizeChange(1),
      'Meta+Slash, Ctrl+Slash': () => setMonoMode(!monoMode),
      'Meta+KeyM, Ctrl+KeyM': () => handleMarkdownViewChange('FULL'),
      'Meta+Alt+KeyM, Ctrl+Alt+KeyM': () => handleMarkdownViewChange('HALF'),
      'Meta+Alt+KeyN, Ctrl+Alt+KeyN': () => handleMarkdownViewChange('NONE'),
    },
  })

  return (
    <>
      <div className="absolute inset-0 flex flex-col">
        <div
          className={line(`
            relative z-10 h-10 md:h-8 flex-shrink-0 flex items-center border-b bg-white
            dark:bg-zinc-800 dark:border-zinc-600
            ${activeEntry ? '' : 'hidden'}
          `)}
        >
          <ToolButton
            title={t`action.save`}
            icon={<SvgIcon.Save />}
            disabled={submitDisabled}
            loading={saving}
            onClick={handleSaveClick}
          />
          <ToolButton
            title={t`action.reset`}
            icon={<SvgIcon.Restart />}
            disabled={value === textContent}
            onClick={handleResetClick}
          />
          <ToolButton
            title={t`action.copy`}
            icon={<SvgIcon.Copy />}
            disabled={!activeEntry}
            onClick={() => {
              copy(value)
              toast.success('OK')
            }}
          />
          <ToolButton
            title={t`action.fontSizeReduce`}
            icon={<SvgIcon.FontSmall />}
            disabled={textEditorFontSize <= 12}
            onClick={() => handleFontSizeChange(-1)}
          />
          <ToolButton
            title={t`action.fontSizeIncrease`}
            icon={<SvgIcon.FontLarge />}
            disabled={textEditorFontSize >= 36}
            onClick={() => handleFontSizeChange(1)}
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
            disabled={!isMarkdown}
            active={['HALF', 'FULL'].includes(markdownView)}
            onClick={handleMarkdownViewChange}
          />
        </div>
        <div className="flex-grow relative">
          {!activeEntry && <Opener appId={appId} />}
          {activeEntry && (
            <code
              className="absolute inset-0"
              style={monoMode ? undefined : { fontFamily: 'unset' }}
            >
              <div className="flex h-full">
                <textarea
                  className={line(`
                    p-2 h-full outline-none resize-none bg-transparent
                    dark:text-zinc-200
                    ${markdownView === 'NONE'
                      ? 'w-full'
                      : markdownView === 'FULL'
                        ? 'hidden'
                        : 'w-1/2'
                    }
                  `)}
                  style={{ fontSize: textEditorFontSize }}
                  value={value}
                  onChange={e => setValue(e.target.value)}
                />
                {(isMarkdown && markdownView !== 'NONE') && (
                  <div
                    className={line(`
                      markdown-body
                      p-6 w-1/2 h-full bg-white overflow-y-auto
                      dark:bg-zinc-800
                      ${markdownView === 'FULL' ? 'w-full' : 'border-l w-1/2 dark:border-zinc-600'}
                    `)}
                  >
                    <ReactMarkdown
                      skipHtml={false}
                      children={value}
                      components={{
                        a(props) {
                          return <a target="_blank" {...props}>{props.children}</a>
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </code>
          )}
        </div>
      </div>
    </>
  )
}
