import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Confirmor, Opener, SvgIcon, ToolButton } from '../../components/common'
import { copy, ENTRY_ICON_LIST, getEntryPath, line } from '../../utils'
import { FsApi } from '../../api'
import { AppComponentProps, AppId, IEntry } from '../../types'
import { useOpenEvent, useRequest } from '../../hooks'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import 'github-markdown-css/github-markdown-light.css'

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
  } = useOpenEvent(appId)

  const [value, setValue] = useState('')
  const [monoMode, setMonoMode] = useState(false)
  const [markdownView, setMarkdownView] = useState(false)
  const [markdownFullView, setMarkdownFullView] = useState(false)
  const [fontSize, setFontSize] = useState(14)

  const { request: queryTextContent, data, setData } = useRequest(FsApi.queryTextContent, { success: true, message: 'OK', data: '' })
  const { request: uploadFile, loading: saving } = useRequest(FsApi.uploadFile)

  const isMarkdown = useMemo(() => activeEntry?.extension === 'md', [activeEntry])
  const textContent = useMemo(() => data?.data || '', [data])
  const submitDisabled = useMemo(() => {
    return (value === textContent && !saving ) || !activeEntry
  }, [activeEntry, saving, textContent, value])

  useEffect(() => {
    if (isMarkdown) {
      setMarkdownView(true)
    } else {
      setMarkdownView(false)
      setMarkdownFullView(false)
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
      // TODO: 1024 and size control
      if (size && size > 512000) {
          Confirmor({
            t,
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
  }, [t, activeEntry, handleOpen, setActiveIndex])

  useEffect(() => {
    setValue(typeof textContent === 'object' ? JSON.stringify(textContent) : textContent)
  }, [textContent])

  const handleSave = useCallback(async () => {
    if (activeEntry) {
      const blob = new Blob([value], { type: 'text/plain;charset=utf-8' })
      const file = new File([blob], activeEntry.name)
      // TODO: use patch
      const { success } = await uploadFile(getEntryPath(activeEntry), file)
      if (success) {
        toast.success('OK')
        setData({ success: true, message: 'OK', data: value })
      }
    }
  }, [value, activeEntry, uploadFile, setData])

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
        <div className={`relative z-10 h-10 md:h-8 flex-shrink-0 flex items-center border-b bg-white ${activeEntry ? '' : 'hidden'}`}>
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
          )}
        </div>
      </div>
    </>
  )
}
