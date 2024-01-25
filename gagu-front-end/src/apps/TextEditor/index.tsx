import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Confirmor, Opener } from '../../components/common'
import { ENTRY_ICON_LIST, generateTextFile, getEntryPath, line } from '../../utils'
import { FsApi } from '../../api'
import { AppComponentProps, AppId, ExistingStrategy, IEntry } from '../../types'
import { useRunAppEvent, useRequest, useHotKey, useUserConfig } from '../../hooks'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'
import { lastChangedDirectoryState } from '../../states'
import Toolbar from './Toolbar'
import MarkdownView, { MarkdownViewType } from './MarkdownView'
import BottomBar from './BottomBar'

const appId = AppId.textEditor

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

  const [textContent, setTextContent] = useState('')
  const [monoMode, setMonoMode] = useState(false)
  const [markdownView, setMarkdownView] = useState<MarkdownViewType>('NONE')

  const { request: queryTextContent, response, setResponse } = useRequest(FsApi.queryTextContent, {
    success: true,
    message: 'OK',
    data: '',
  })

  const { request: createFile, loading: saving } = useRequest(FsApi.createFile)

  const isMarkdown = useMemo(() => activeEntry?.extension === 'md', [activeEntry])
  const textContentCache = useMemo(() => response?.data || '', [response])

  const isSaveDisabled = useMemo(() => {
    return (textContent === textContentCache && !saving ) || !activeEntry
  }, [activeEntry, saving, textContentCache, textContent])

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

  const handleSaveClick = useCallback(async () => {
    if (!activeEntry || isSaveDisabled) return
    const file = generateTextFile(textContent, activeEntry.name)
    const { success } = await createFile(getEntryPath(activeEntry), file, ExistingStrategy.replace)
    if (success) {
      toast.success('OK')
      setResponse({ success: true, message: 'OK', data: textContent })
      setLastChangedDirectory({ path: activeEntry.parentPath, timestamp: Date.now() })
    }
  }, [activeEntry, isSaveDisabled, textContent, createFile, setResponse, setLastChangedDirectory])

  const handleResetClick = useCallback(() => {
    setTextContent(textContentCache)
  }, [textContentCache])

  const handleFontSizeChange = useCallback((step: number) => {
    const isOutOfRange = (step < 0 && textEditorFontSize <= 12) ||
      (step > 0 && textEditorFontSize >= 36)
    if (isOutOfRange) return
    const fontSize = textEditorFontSize + step
    setUserConfig({ ...userConfig, textEditorFontSize: fontSize })
  }, [setUserConfig, textEditorFontSize, userConfig])

  const handleDownload = useCallback(() => {
    const blob = new Blob([textContent])
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = activeEntry?.name
    a.click()
  }, [activeEntry, textContent])

  const handleMarkdownViewChange = useCallback((view?: MarkdownViewType) => {
    const targetView = view || {
      NONE: 'HALF',
      HALF: 'FULL',
      FULL: 'NONE',
    }[markdownView] as MarkdownViewType

    setMarkdownView(targetView)
  }, [markdownView])

  useEffect(() => {
    setTextContent(
      typeof textContentCache === 'object'
        ? JSON.stringify(textContentCache)
        : textContentCache
    )
  }, [textContentCache])

  useEffect(() => {
    setMarkdownView(isMarkdown ? 'HALF' : 'NONE')
  }, [isMarkdown])

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

  useHotKey({
    binding: isTopWindow,
    fnMap: {
      'Meta+KeyS, Ctrl+KeyS': handleSaveClick,
      'Meta+KeyR, Ctrl+KeyR': handleResetClick,
      'Meta+Minus, Ctrl+Minus': () => handleFontSizeChange(-1),
      'Meta+Equal, Ctrl+Equal': () => handleFontSizeChange(1),
      'Meta+KeyD, Ctrl+KeyD': () => handleDownload(),
      'Meta+Slash, Ctrl+Slash': () => setMonoMode(!monoMode),
      'Meta+KeyM, Ctrl+KeyM': () => handleMarkdownViewChange('FULL'),
      'Meta+Alt+KeyM, Ctrl+Alt+KeyM': () => handleMarkdownViewChange('HALF'),
      'Meta+Alt+KeyN, Ctrl+Alt+KeyN': () => handleMarkdownViewChange('NONE'),
    },
  })

  return (
    <>
      <div className="absolute inset-0 flex flex-col">
        <Toolbar
          {...{
            activeEntry,
            textContent, textContentCache, textEditorFontSize,
            monoMode, setMonoMode,
            isSaveDisabled, saving,
            markdownView,
          }}
          onSave={handleSaveClick}
          onReset={handleResetClick}
          onFontSizeChange={handleFontSizeChange}
          onDownlaod={handleDownload}
          onMarkdownViewChange={handleMarkdownViewChange}
        />
        <div className="flex-grow relative">
          <Opener show={!activeEntry} appId={appId} />

          {activeEntry && (
            <div className="absolute inset-0">
              <code
                className={line(`
                  absolute top-0 left-0 bottom-0
                  transtion-width duration-200
                  ${markdownView === 'NONE'
                    ? 'w-full'
                    : markdownView === 'FULL'
                      ? 'w-0'
                      : 'w-1/2'
                  }
                `)}
                style={monoMode ? undefined : { fontFamily: 'unset' }}
              >
                <textarea
                  className="p-4 min-w-[200px] w-full h-full outline-none resize-none bg-transparent dark:text-zinc-200"
                  style={{ fontSize: textEditorFontSize }}
                  value={textContent}
                  onChange={e => setTextContent(e.target.value)}
                />
              </code>
              <div
                className={line(`
                  absolute top-0 right-0 bottom-0
                  transtion-width duration-200
                  ${markdownView === 'NONE'
                    ? 'w-0 overflow-hidden'
                    : markdownView === 'FULL'
                      ? 'w-full overflow-y-auto'
                      : 'w-1/2 border-l overflow-y-auto dark:border-zinc-600'
                  }
                `)}
              >
                <MarkdownView
                  content={textContent}
                  currentPath={activeEntry.parentPath}
                />
              </div>
            </div>
          )}
        </div>
        <BottomBar
          {...{
            content: textContent,
            kiloSize,
            activeEntry,
          }}
        />
      </div>
    </>
  )
}
