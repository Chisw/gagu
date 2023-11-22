import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { SvgIcon, ToolButton } from '../../components/common'
import { copy, ENTRY_ICON_LIST, getEntryPath, line } from '../../utils'
import { FsApi } from '../../api'
import { APP_ID_MAP, APP_LIST } from '..'
import { AppComponentProps } from '../../types'
import { useOpenOperation, useRequest } from '../../hooks'
import { useRecoilState } from 'recoil'
import { entrySelectorState } from '../../states'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import 'github-markdown-css/github-markdown-light.css'

export default function TextEditor(props: AppComponentProps) {

  const { isTopWindow, setWindowTitle, setWindowLoading } = props

  const { t } = useTranslation()

  const {
    // matchedEntryList,
    // activeIndex,
    activeEntry,
    // activeEntryStreamUrl,
    // setActiveIndex,
  } = useOpenOperation(APP_ID_MAP.textEditor)

  const [, setEntrySelector] = useRecoilState(entrySelectorState)

  const [value, setValue] = useState('')
  const [monoMode, setMonoMode] = useState(false)
  const [markdownView, setMarkdownView] = useState(false)
  const [markdownFullView, setMarkdownFullView] = useState(false)
  const [fontSize, setFontSize] = useState(14)

  const { request: getTextContent, loading: fetching, data: { data: textContent }, setData: setTextContent } = useRequest(FsApi.getTextContent, { data: '' })
  const { request: uploadFile, loading: saving } = useRequest(FsApi.uploadFile)

  const isMarkdown = useMemo(() => activeEntry?.extension === 'md', [activeEntry])
  const submitDisabled = useMemo(() => (value === textContent && !saving )|| !activeEntry, [activeEntry, saving, textContent, value])

  useEffect(() => setWindowLoading(fetching), [setWindowLoading, fetching])

  useEffect(() => {
    if (isMarkdown) {
      setMarkdownView(true)
    } else {
      setMarkdownView(false)
      setMarkdownFullView(false)
    }
  }, [isMarkdown])

  useEffect(() => {
    if (activeEntry) {
      const { name, extension } = activeEntry
      getTextContent(getEntryPath(activeEntry))
      setWindowTitle(name)
      if (ENTRY_ICON_LIST.find(l => l.type === 'code')?.matchList.includes(extension)) {
        setMonoMode(true)
      }
    }
  }, [activeEntry, getTextContent, setWindowTitle])

  useEffect(() => {
    setValue(typeof textContent === 'object' ? JSON.stringify(textContent) : textContent)
  }, [textContent])

  const handleSave = useCallback(async () => {
    if (activeEntry) {
      const blob = new Blob([value], { type: 'text/plain;charset=utf-8' })
      const file = new File([blob], activeEntry.name)
      const { success } = await uploadFile(getEntryPath(activeEntry), file)
      if (success) {
        toast.success('OK')
        setTextContent(value)
      }
    }
  }, [value, activeEntry, uploadFile, setTextContent])

  const bindCtrlS = useCallback((e: any) => {
    const currKey = e.keyCode || e.which || e.charCode
    if (currKey === 83 && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      if (!isTopWindow || submitDisabled) return
      handleSave()
    }
  }, [handleSave, submitDisabled, isTopWindow])

  useEffect(() => {
    window.addEventListener('keydown', bindCtrlS)
    return () => window.removeEventListener('keydown', bindCtrlS)
  }, [bindCtrlS])

  return (
    <>
      <div className="absolute inset-0 flex flex-col">
        <div className="h-10 md:h-8 flex-shrink-0 flex items-center border-b bg-white">
          <ToolButton
            title={t`action.save`}
            icon={<SvgIcon.Save />}
            disabled={submitDisabled}
            loading={saving}
            onClick={handleSave}
          />
          <ToolButton
            title={t`action.reset`}
            icon={<SvgIcon.Restart />}
            disabled={value === textContent}
            onClick={() => setValue(textContent)}
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
            disabled={fontSize <= 12}
            onClick={() => setFontSize(fontSize - 2)}
          />
          <ToolButton
            title={t`action.fontSizeIncrease`}
            icon={<SvgIcon.FontLarge />}
            disabled={fontSize >= 32}
            onClick={() => setFontSize(fontSize + 2)}
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
            icon={<SvgIcon.Markdown />}
            disabled={!isMarkdown}
            active={markdownView}
            onClick={() => setMarkdownView(!markdownView)}
          />
          <ToolButton
            title={t`action.markdownFullView`}
            icon={<SvgIcon.MarkdownSolid />}
            disabled={!markdownView}
            active={markdownFullView}
            onClick={() => setMarkdownFullView(!markdownFullView)}
          />
        </div>
        <div className="flex-grow relative">
          {activeEntry ? (
            <code
              className="absolute inset-0"
              style={monoMode ? undefined : { fontFamily: 'unset' }}
            >
              <div className="flex h-full">
                <textarea
                  className={line(`
                    p-2 h-full outline-none resize-none bg-transparent
                    ${markdownView
                      ? markdownFullView
                        ? 'hidden'
                        : 'w-1/2'
                      : 'w-full'
                    }
                  `)}
                  style={{ fontSize }}
                  value={value}
                  onChange={e => setValue(e.target.value)}
                />
                {(isMarkdown && markdownView) && (
                  <div
                    className={line(`
                      markdown-body p-6 w-1/2 h-full bg-white overflow-y-auto
                      ${markdownFullView ? 'w-full' : 'border-l w-1/2'}
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
          ) : (
            <div
              className="m-2 p-2 border border-gray-400 cursor-pointer text-xs rounded-sm text-center hover:border-gray-600"
              onClick={() => setEntrySelector({ show: true, app: APP_LIST.find(a => a.id === APP_ID_MAP.textEditor) })}
            >
              {t`action.openFile`}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
