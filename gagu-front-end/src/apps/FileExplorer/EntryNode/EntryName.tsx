import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { useRequest } from '../../../hooks'
import { generateNewName, generateTextFile, line, setInputSelection } from '../../../utils'
import { FsApi } from '../../../api'
import { INVALID_NAME_CHAR_LIST } from '../../../utils'
import { EditMode, CreationType, EntryType, IEntry, NameFailType } from '../../../types'
import { useTranslation } from 'react-i18next'

interface EntryNameProps {
  creationType?: CreationType
  inputMode?: boolean
  entry?: IEntry,
  isSelected?: boolean
  gridMode: boolean
  parentPath: string
  onSuccess: (entry: IEntry) => void
  onFail: (failType: NameFailType) => void
}

export default function EntryName(props: EntryNameProps) {
  const {
    creationType = EditMode.createFolder,
    inputMode = false,
    entry = undefined,
    isSelected = false,
    gridMode,
    parentPath,
    onSuccess,
    onFail,
  } = props

  const { t } = useTranslation()

  const entryName = entry?.name

  const [inputValue, setInputValue] = useState<string>(entryName || generateNewName())

  const { request: queryExists, loading: loadingExist } = useRequest(FsApi.queryExists)
  const { request: createDirectory, loading: loadingNewDir } = useRequest(FsApi.createDirectory)
  const { request: renameEntry, loading: loadingRename } = useRequest(FsApi.renameEntry)
  const { request: createFile } = useRequest(FsApi.createFile)

  const handleInputChange = useCallback((e: any) => {
    setInputValue(e.target.value)
  }, [])

  const handleName = useCallback(async (e: any) => {
    const oldName = entry?.name
    const newName = e.target.value as string

    if (!newName) {
      onFail('empty')
      return
    }

    if (INVALID_NAME_CHAR_LIST.some(char => newName.includes(char))) {
      onFail('invalid')
      toast.error(t('tip.illegalCharacters', { characters: INVALID_NAME_CHAR_LIST.join(' ') }))
      return
    }

    if (oldName && (newName === oldName)) {
      onFail('cancel')
      return
    }

    const finalName = creationType === EditMode.createFolder || newName.includes('.')
      ? newName
      : `${newName}.txt`

    const toPath = `${parentPath}/${finalName}`
    const { data: exists } = await queryExists(toPath)

    if (exists) {
      onFail('existed')
      toast.error(t('tip.targetExists', { name: finalName }))
    } else {
      if (oldName) {
        const fromPath = `${parentPath}/${oldName}`
        const { success } = await renameEntry(fromPath, toPath)
        if (success) {
          onSuccess({ ...entry!, name: finalName })
        }
      } else {
        if (creationType === EditMode.createFolder) {
          const { success } = await createDirectory(toPath)
          if (success) {
            onSuccess({
              name: finalName,
              type: EntryType.directory,
              parentPath: parentPath,
              lastModified: 0,
              hasChildren: false,
              hidden: false,
              extension: '_dir',
            })
          }
        } else if (creationType === EditMode.createText) {
          const file = generateTextFile('', finalName)
          const fullPath = `${parentPath}/${finalName}`
          const { success } = await createFile(fullPath, file)
          if (success) {
            onSuccess({
              name: finalName,
              type: EntryType.file,
              parentPath: parentPath,
              lastModified: 0,
              hasChildren: false,
              hidden: false,
              extension: '',
            })
          }
        }
      }
    }
  }, [
    t,
    entry,
    parentPath,
    creationType,
    queryExists,
    createDirectory,
    renameEntry,
    createFile,
    onSuccess,
    onFail,
  ])

  const handleFocus = useCallback(() => {
    const input = document.getElementById('file-explorer-name-input') as HTMLInputElement | undefined
    if (input && entry) {
      const { name, extension } = entry
      const end = extension ? name.lastIndexOf(`.${extension}`) : name.length
      setInputSelection(input, 0, end)
    }
  }, [entry])

  const handleKeyDown = useCallback((e: any) => {
    const { key } = e
    if (key === 'Enter') {
      e.preventDefault()
      handleName(e)
    } else if (key === 'Escape') {
      onFail('cancel')
    }
  }, [handleName, onFail])

  return (
    <div
      className={line(`
        w-full leading-none
        ${gridMode ? 'mt-1 text-center' : 'ml-4 flex justify-start items-center'}
        ${inputMode ? '' : 'pointer-events-none'}
      `)}
    >
      {inputMode ? (
        <div
          className={line(`
            relative bg-white border border-gray-300 rounded
            ${gridMode ? 'h-8' : 'w-full h-5'}
            ${(loadingExist || loadingNewDir || loadingRename) ? 'bg-loading' : ''}
          `)}
        >
          <textarea
            id="file-explorer-name-input"
            autoFocus
            autoComplete="off"
            className={line(`
              block px-1 w-full h-full bg-transparent break-words
              text-xs text-gray-700 border-none shadow-inner
              resize-none overflow-x-hidden overflow-y-auto scrollbar-hidden
              dark:bg-zinc-600 dark:text-zinc-200
              ${gridMode ? 'text-center' : 'text-left'}
            `)}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleName}
            onKeyDown={handleKeyDown}
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
      className={line(`
        gagu-entry-node-name
        px-1 rounded text-xs
        ${gridMode ? 'max-w-full line-clamp-2' : 'w-full truncate'}
        ${isSelected ? 'text-white' : 'text-gray-700 dark:text-zinc-200'}
        ${isSelected && gridMode ? 'bg-blue-600' : ''}
      `)}
    >
      {entryName}
    </span>
  )
}
