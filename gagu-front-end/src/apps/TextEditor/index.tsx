import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ToolButton from '../../components/ToolButton'
import { copy, ENTRY_ICON_LIST, getEntryPath } from '../../utils'
import { FsApi } from '../../api'
import { APP_ID_MAP, APP_LIST } from '..'
import { AppComponentProps } from '../../types'
import { SvgIcon } from '../../components/base'
import { useOpenOperation, useRequest } from '../../hooks'
import { useRecoilState } from 'recoil'
import { entrySelectorState } from '../../states'

export default function TextEditor(props: AppComponentProps) {

  const { setWindowTitle, setWindowLoading } = props

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

  const { request: getTextContent, loading: fetching, data: textContent, setData: setTextContent } = useRequest(FsApi.getTextContent)
  const { request: uploadFile, loading: saving } = useRequest(FsApi.uploadFile)

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
      const { success } = await uploadFile(getEntryPath(activeEntry), file)
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
            disabled={(value === textContent && !saving )|| !activeEntry}
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
            disabled={!activeEntry}
            onClick={() => setMonoMode(!monoMode)}
          />
          <ToolButton
            title="复制文本"
            icon={<SvgIcon.Copy />}
            disabled={!activeEntry}
            onClick={() => {
              copy(value)
              toast.success('文本复制成功')
            }}
          />
        </div>
        <div className="flex-grow">
          {activeEntry ? (
            <code style={monoMode ? undefined : { fontFamily: 'unset' }}>
              <textarea
                className="p-2 w-full h-full outline-none resize-none bg-transparent text-xs"
                value={value}
                onChange={e => setValue(e.target.value)}
              />
            </code>
          ) : (
            <div
              className="m-2 p-2 border border-gray-400 cursor-pointer text-xs rounded-sm text-center hover:border-gray-600"
              onClick={() => setEntrySelector({ show: true, app: APP_LIST.find(a => a.id === APP_ID_MAP.textEditor) })}
            >
              打开文件
            </div>
          )}
        </div>
      </div>
    </>
  )
}
