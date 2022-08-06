import { Copy16, Reset16, Save16, TextAllCaps16 } from '@carbon/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import Toast from '../components/EasyToast'
import ToolButton from '../components/ToolButton'
import CommonToolButtons from '../components/CommonToolButtons'
import useFetch from '../hooks/useFetch'
import { copy } from '../utils'
import { getTextFileContent, uploadFile } from '../utils/api'
import { APP_ID_MAP } from '../utils/appList'
import { openedEntryListState } from '../utils/state'
import { AppComponentProps, IOpenedEntry } from '../utils/types'

export default function TextEditor(props: AppComponentProps) {

  const { setWindowTitle, setWindowLoading } = props

  const [openedEntryList, setOpenedEntryList] = useRecoilState(openedEntryListState)
  const [currentEntry, setCurrentEntry] = useState<IOpenedEntry | null>(null)
  const [value, setValue] = useState('')
  const [monoMode, setMonoMode] = useState(false)

  const { fetch: fetchTextContent, loading: fetching, data: textContent, setData: setTextContent } = useFetch(getTextFileContent)
  const { fetch: uploadFileToPath, loading: saving } = useFetch(uploadFile)

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
      const { parentPath, name, isOpen } = currentEntry
      if (!isOpen) {
        fetchTextContent(`${parentPath}/${name}`)
        setWindowTitle(name)
        setCurrentEntry({ ...currentEntry, isOpen: true })
      }
    }
  }, [currentEntry, fetchTextContent, setWindowTitle])

  useEffect(() => {
    setValue(textContent)
  }, [textContent])

  const handleSave = useCallback(async () => {
    if (currentEntry) {
      const blob = new Blob([value], { type: 'text/plain;charset=utf-8' })
      const file = new File([blob], currentEntry.name)
      const data = await uploadFileToPath(currentEntry.parentPath, file)
      const isUploaded = !!data?.hasDon
      if (isUploaded) {
        Toast.toast('保存成功')
        setTextContent(value)
      }
    }
  }, [value, currentEntry, uploadFileToPath, setTextContent])

  return (
    <>
      <div className="absolute inset-0 flex flex-col">
        <div className="h-8 flex-shrink-0 flex items-center border-b bg-white">
          <ToolButton
            title="保存"
            icon={<Save16 />}
            disabled={value === textContent && !saving}
            loading={saving}
            onClick={handleSave}
          />
          <ToolButton
            title="重置"
            icon={<Reset16 />}
            disabled={value === textContent}
            onClick={() => setValue(textContent)}
          />
          <ToolButton
            title="等宽"
            icon={<TextAllCaps16 />}
            onClick={() => setMonoMode(!monoMode)}
          />
          <ToolButton
            title="复制文本"
            icon={<Copy16 />}
            onClick={() => {
              copy(value)
              Toast.toast('文本复制成功')
            }}
          />
          <CommonToolButtons {...{ currentEntry }} />
        </div>
        <div className="flex-grow">
          <code style={monoMode ? undefined : { fontFamily: 'unset' }}>
            <textarea
              className="p-2 w-full h-full outline-none resize-none bg-transparent"
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          </code>
        </div>
      </div>
    </>
  )
}
