import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ToolButton from '../../components/ToolButton'
import { copy, ENTRY_ICON_LIST } from '../../utils'
import { FsApi } from '../../api'
import { APP_ID_MAP } from '..'
import { AppComponentProps } from '../../types'
import { SvgIcon } from '../../components/base'
import { useOpenOperation, useFetch } from '../../hooks'

export default function TextEditor(props: AppComponentProps) {

  const { setWindowTitle, setWindowLoading } = props

  const {
    // matchedEntryList,
    // activeIndex,
    activeEntry,
    // activeEntryStreamUrl,
    // setActiveIndex,
  } = useOpenOperation(APP_ID_MAP.textEditor)

  const [value, setValue] = useState('')
  const [monoMode, setMonoMode] = useState(false)

  const { fetch: getTextContent, loading: fetching, data: textContent, setData: setTextContent } = useFetch(FsApi.getTextContent)
  const { fetch: uploadFile, loading: saving } = useFetch(FsApi.uploadFile)

  useEffect(() => setWindowLoading(fetching), [setWindowLoading, fetching])

  useEffect(() => {
    if (activeEntry) {
      const { parentPath, name, extension } = activeEntry
      getTextContent(`${parentPath}/${name}`)
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
      const { success } = await uploadFile(activeEntry.parentPath, file)
      if (success) {
        toast.success('保存成功')
        setTextContent(value)
      }
    }
  }, [value, activeEntry, uploadFile, setTextContent])

  return (
    <>
      <div className="absolute inset-0 flex flex-col">
        <div className="h-8 flex-shrink-0 flex items-center border-b bg-white">
          <ToolButton
            title="保存"
            icon={<SvgIcon.Save />}
            disabled={value === textContent && !saving}
            loading={saving}
            onClick={handleSave}
          />
          <ToolButton
            title="重置"
            icon={<SvgIcon.Restart />}
            disabled={value === textContent}
            onClick={() => setValue(textContent)}
          />
          <ToolButton
            title="等宽显示"
            icon={<SvgIcon.CodeSlash />}
            onClick={() => setMonoMode(!monoMode)}
          />
          <ToolButton
            title="复制文本"
            icon={<SvgIcon.Copy />}
            onClick={() => {
              copy(value)
              toast.success('文本复制成功')
            }}
          />
        </div>
        <div className="flex-grow">
          <code style={monoMode ? undefined : { fontFamily: 'unset' }}>
            <textarea
              className="p-2 w-full h-full outline-none resize-none bg-transparent text-xs"
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          </code>
        </div>
      </div>
    </>
  )
}
