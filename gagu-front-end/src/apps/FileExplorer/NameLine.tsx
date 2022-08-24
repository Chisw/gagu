import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { useFetch } from '../../hooks'
import { line } from '../../utils'
import { FsApi } from '../../api'
import { INVALID_NAME_CHAR_LIST } from '../../utils/constant'
import { EntryType, IEntry } from '../../utils/types'

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

  const { fetch: getExists, loading: loadingExist } = useFetch(FsApi.getExists)
  const { fetch: addDirectory, loading: loadingNewDir } = useFetch(FsApi.addDirectory)
  const { fetch: renameEntry, loading: loadingRename } = useFetch(FsApi.renameEntry)
  const { fetch: uploadFile } = useFetch(FsApi.uploadFile)

  const handleName = useCallback(async (e: any) => {
    const oldName = entry?.name
    const newName = e.target.value as string

    if (!newName) {
      onFail('empty')
      return
    }

    if (INVALID_NAME_CHAR_LIST.some(char => newName.includes(char))) {
      onFail('invalid')
      toast.error(`存在非法字符：${INVALID_NAME_CHAR_LIST.join(' ')}`)
      return
    }

    if (oldName && (newName === oldName)) {
      onFail('no_change')
      return
    }

    const newPath = `${currentDirPath}/${newName}`
    const { exists } = await getExists(newPath)
    if (exists) {
      onFail('exist')
      toast.error('已存在')
    } else {
      if (oldName) {  // rename
        const oldPath = `${currentDirPath}/${oldName}`
        const { success } = await renameEntry(oldPath, newPath)
        if (success) {
          onSuccess({ ...entry!, name: newName })
        } else {
          onFail('net_error')
        }
      } else {  // new dir
        if (create === 'dir') {
          const { success } = await addDirectory(newPath)
          if (success) {
            onSuccess({ name: newName, type: EntryType.directory, parentPath: currentDirPath, lastModified: 0, hasChildren: false, hidden: false, extension: '_dir' })
          } else {
            onFail('net_error')
          }
        } else if (create === 'txt') {
          const blob = new Blob([''], { type: 'text/plain;charset=utf-8' })
          const suffix = newName.includes('.') ? '' : '.txt'
          const name = newName + suffix
          const file = new File([blob], name)
          const { success } = await uploadFile(currentDirPath, file)
          if (success) {
            onSuccess({ name, type: EntryType.file, parentPath: currentDirPath, lastModified: 0, hasChildren: false, hidden: false, extension: '' })
          } else {
            onFail('net_error')
          }
        }
      }
    }
  }, [entry, currentDirPath, create, getExists, addDirectory, renameEntry, uploadFile, onSuccess, onFail])

  return (
    <div className={`w-full leading-none ${gridMode ? 'mt-1 text-center' : 'ml-4 flex justify-center items-center'}`}>
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
