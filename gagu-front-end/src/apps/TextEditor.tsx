import { useCallback, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import toast from 'react-hot-toast'
import ToolButton from '../components/ToolButton'
import CommonToolButtons from '../components/CommonToolButtons'
import useFetch from '../hooks/useFetch'
import { copy, ENTRY_ICON_LIST } from '../utils'
import { FsApi } from '../api'
import { APP_ID_MAP } from '../utils/appList'
import { openedEntryListState } from '../utils/state'
import { AppComponentProps, IOpenedEntry } from '../utils/types'
import { SvgIcon } from '../components/base'

export default function TextEditor(props: AppComponentProps) {

  const { setWindowTitle, setWindowLoading } = props

  const [openedEntryList, setOpenedEntryList] = useRecoilState(openedEntryListState)
  const [currentEntry, setCurrentEntry] = useState<IOpenedEntry | null>(null)
  const [value, setValue] = useState('')
  const [monoMode, setMonoMode] = useState(false)

  const { fetch: getTextContent, loading: fetching, data: textContent, setData: setTextContent } = useFetch(FsApi.getTextContent)
  const { fetch: uploadFile, loading: saving } = useFetch(FsApi.uploadFile)

  useEffect(() => setWindowLoading(fetching), [setWindowLoading, fetching])

  useEffect(() => {
    const openedEntry = openedEntryList[0]
    if (openedEntry && !openedEntry.isOpen && openedEntry.openAppId === APP_ID_MAP.textEditor) {
      setCurrentEntry(openedEntry)
      setOpenedEntryList([])
    }

  }, [openedEntryList, setOpenedEntryList])

  useEffect(() => {
    if (currentEntry) {
      const { parentPath, name, isOpen, extension } = currentEntry
      if (!isOpen) {
        getTextContent(`${parentPath}/${name}`)
        setWindowTitle(name)
        setCurrentEntry({ ...currentEntry, isOpen: true })
      }
      if (ENTRY_ICON_LIST.find(l => l.type === 'code')?.matchList.includes(extension)) {
        setMonoMode(true)
      }
    }
  }, [currentEntry, getTextContent, setWindowTitle])

  useEffect(() => {
    setValue(typeof textContent === 'object' ? JSON.stringify(textContent) : textContent)
  }, [textContent])

  const handleSave = useCallback(async () => {
    if (currentEntry) {
      const blob = new Blob([value], { type: 'text/plain;charset=utf-8' })
      const file = new File([blob], currentEntry.name)
      const { success } = await uploadFile(currentEntry.parentPath, file)
      if (success) {
        toast.success('保存成功')
        setTextContent(value)
      }
    }
  }, [value, currentEntry, uploadFile, setTextContent])

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
          <CommonToolButtons {...{ currentEntry }} />
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
