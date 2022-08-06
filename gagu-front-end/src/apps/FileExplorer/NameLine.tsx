import { useCallback, useState } from 'react'
import Toast from '../../components/EasyToast'
import useFetch from '../../hooks/useFetch'
import { line } from '../../utils'
import { getIsExist, addNewDir, renameEntry, uploadFile } from '../../utils/api'
import { INVALID_NAME_CHAR_LIST } from '../../utils/constant'
import { IEntry } from '../../utils/types'

export type NameFailType = 'escape' | 'empty' | 'exist' | 'no_change' | 'net_error' | 'invalid'

interface NameLineProps {
  create?: 'dir' | 'txt' 
  showInput?: boolean
  entry?: IEntry,
  isSelected?: boolean
  gridMode: boolean
  currentDirPath: string
  onSuccess: (entry: IEntry) => void
  onFail: (failType: NameFailType) => void
}

export default function NameLine(props: NameLineProps) {

  const {
    create,
    showInput = false,
    entry = undefined,
    isSelected = false,
    gridMode,
    currentDirPath,
    onSuccess,
    onFail,
  } = props

  const entryName = entry?.name
  const [inputValue, setInputValue] = useState(entryName)

  const handleInputChange = useCallback((e: any) => {
    setInputValue(e.target.value)
  }, [])

  const { fetch: fetchExist, loading: loadingExist } = useFetch(getIsExist)
  const { fetch: fetchNewDir, loading: loadingNewDir } = useFetch(addNewDir)
  const { fetch: fetchRename, loading: loadingRename } = useFetch(renameEntry)
  const { fetch: uploadFileToPath } = useFetch(uploadFile)

  const handleName = useCallback(async (e: any) => {
    const oldName = entry?.name
    const newName = e.target.value as string

    if (!newName) {
      onFail('empty')
      return
    }

    if (INVALID_NAME_CHAR_LIST.some(char => newName.includes(char))) {
      onFail('invalid')
      Toast.warning(`存在非法字符：${INVALID_NAME_CHAR_LIST.join(' ')}`)
      return
    }

    if (oldName && (newName === oldName)) {
      onFail('no_change')
      return
    }

    const newPath = `${currentDirPath}/${newName}`
    const { exists } = await fetchExist(newPath)
    if (exists) {
      onFail('exist')
      Toast.warning('已存在')
    } else {
      if (oldName) {  // rename
        const oldPath = `${currentDirPath}/${oldName}`
        const { ok } = await fetchRename(oldPath, newPath)
        if (ok) {
          onSuccess({ ...entry!, name: newName })
        } else {
          onFail('net_error')
        }
      } else {  // new dir
        if (create === 'dir') {
          const { ok } = await fetchNewDir(newPath)
          if (ok) {
            onSuccess({ name: newName, type: 'directory', parentPath: currentDirPath })
          } else {
            onFail('net_error')
          }
        } else if (create === 'txt') {
          const blob = new Blob([''], { type: 'text/plain;charset=utf-8' })
          const suffix = newName.includes('.') ? '' : '.txt'
          const name = newName + suffix
          const file = new File([blob], name)
          const data = await uploadFileToPath(currentDirPath, file)
          const isUploaded = !!data?.hasDon
          if (isUploaded) {
            onSuccess({ name, type: 'file', parentPath: currentDirPath })
          } else {
            onFail('net_error')
          }
        }
      }
    }
  }, [entry, currentDirPath, create, fetchExist, fetchNewDir, fetchRename, uploadFileToPath, onSuccess, onFail])

  return (
    <div className={`w-full leading-none ${gridMode ? 'mt-2 text-center' : 'ml-4 flex justify-center items-center'}`}>
      {showInput ? (
        <div
          className={line(`
            relative h-4 bg-white border border-gray-300 rounded
            ${(loadingExist || loadingNewDir || loadingRename) ? 'bg-loading' : ''}
          `)}
        >
          <input
            id="file-explorer-name-input"
            autoFocus
            autoComplete="false"
            placeholder="请输入名称"
            className="block px-1 max-w-full h-full bg-transparent text-xs text-left text-gray-700 border-none shadow-inner"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              ;(document.getElementById('file-explorer-name-input') as any)?.select()
            }}
            onBlur={handleName}
            onKeyUp={e => {
              const { key } = e
              if (key === 'Enter') {
                handleName(e)
              } else if (key === 'Escape') {
                onFail('escape')
              }
            }}
          />
        </div>
      ) : (
        <NameLabel {...{ entryName, gridMode, isSelected }} />
      )}
    </div>
  )
}

interface NameLabelProps {
  entryName?: string
  isSelected?: boolean
  gridMode: boolean
}

export function NameLabel(props: NameLabelProps) {

  const {
    entryName,
    gridMode,
    isSelected,
  } = props

  return (
    <span
      title={entryName}
      className={line(`
        inline-block px-1 rounded truncate text-xs
        ${isSelected ? 'bg-blue-600 text-white' : 'text-gray-700'}
        ${gridMode ? 'max-w-full' : 'w-full'}
      `)}
    >
      {entryName}
    </span>
  )
}
