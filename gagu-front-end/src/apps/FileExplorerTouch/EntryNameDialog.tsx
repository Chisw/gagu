import { Button, Input, Modal } from '@douyinfe/semi-ui'
import { EditMode, EditModeType, IEntry } from '../../types'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useState } from 'react'
import { useRequest } from '../../hooks'
import { FsApi } from '../../api'
import { INVALID_NAME_CHAR_LIST, generateNewName, setInputSelection } from '../../utils'
import toast from 'react-hot-toast'

const titleMap = {
  [EditMode.createFolder]: 'newFolder',
  [EditMode.createText]: 'newTextFile',
  [EditMode.rename]: 'rename',
}

interface EntryNameDialogProps {
  editMode: EditModeType | null
  setEditMode: (mode: EditModeType | null) => void
  currentPath: string
  activeEntry: IEntry | null
  onSuccess: () => void
}

export default function EntryNameDialog(props: EntryNameDialogProps) {
  const {
    editMode,
    setEditMode,
    currentPath,
    activeEntry,
    onSuccess,
  } = props

  const { t } = useTranslation()

  const [newName, setNewName] = useState('')

  const { request: queryExists, loading: loadingExist } = useRequest(FsApi.queryExists)
  const { request: createDirectory, loading: loadingNewDir } = useRequest(FsApi.createDirectory)
  const { request: updateEntryName, loading: loadingRename } = useRequest(FsApi.updateEntryName)
  const { request: uploadFile } = useRequest(FsApi.uploadFile)

  const handleName = useCallback(async () => {
    const oldName = activeEntry?.name

    if (INVALID_NAME_CHAR_LIST.some(char => newName.includes(char))) {
      toast.error(t('tip.illegalCharacters', { characters: INVALID_NAME_CHAR_LIST.join(' ') }))
      return
    }

    if (oldName && (newName === oldName)) {
      toast.error(t('tip.targetExists', { name: newName }))
      return
    }

    const finalName = editMode === EditMode.createText && !newName.includes('.')
      ? `${newName}.txt`
      : newName

    const newPath = `${currentPath}/${finalName}`
    const { data: exists } = await queryExists(newPath)

    if (exists) {
      toast.error(t('tip.targetExists', { name: finalName }))
    } else {
      if (oldName) {  // rename
        const oldPath = `${currentPath}/${oldName}`
        const { success } = await updateEntryName(oldPath, newPath)
        success && onSuccess()
      } else {
        if (editMode === EditMode.createFolder) {
          const { success } = await createDirectory(newPath)
          success && onSuccess()
        } else if (editMode === EditMode.createText) {
          const blob = new Blob([''], { type: 'text/plain;charset=utf-8' })
          const file = new File([blob], finalName)
          const fullPath = `${currentPath}/${finalName}`
          const { success } = await uploadFile(fullPath, file)
          success && onSuccess()
        }
      }
    }
  }, [
    t,
    newName,
    activeEntry,
    currentPath,
    editMode,
    queryExists,
    createDirectory,
    updateEntryName,
    uploadFile,
    onSuccess,
  ])

  useEffect(() => {
    setNewName(editMode === EditMode.rename
      ? activeEntry?.name || ''
      : generateNewName()
    )
  }, [activeEntry, editMode])

  return (
    <>
      <Modal
        closable={false}
        maskClosable={false}
        bodyStyle={{ position: 'relative', padding: 0 }}
        visible={!!editMode}
        className="gagu-entry-name-editor"
        style={{ borderRadius: 10, maxWidth: '90vw' }}
        onCancel={() => setEditMode(null)}
        title={undefined}
        footer={(
          <div className="flex">
            <Button
              size="large"
              className="w-full"
              style={{ margin: 0 }}
              onClick={() => setEditMode(null)}
            >
              {t`action.cancel`}
            </Button>
            <Button
              theme="solid"
              size="large"
              className="w-full"
              disabled={!newName}
              loading={loadingExist || loadingNewDir || loadingRename}
              onClick={handleName}
            >
              {t`action.confirm`}
            </Button>
          </div>
        )}
      >
        <div className="-mb-4">
          <div className="text-center text-lg font-bold">
            {editMode && t(`action.${titleMap[editMode]}`)}
          </div>
          {activeEntry && (
            <div className="text-xs text-gray-500 text-center dark:text-zinc-400">
              {activeEntry.name}
            </div>
          )}
          <div className="mt-4">
            <Input
              autoFocus
              showClear
              id="file-explorer-touch-name-input"
              size="large"
              placeholder={t`hint.input`}
              value={newName}
              onChange={setNewName}
              onFocus={() => {
                const input = document.getElementById('file-explorer-touch-name-input') as HTMLInputElement | undefined
                if (input) {
                  let end = -1 // create mode
                  if (activeEntry) {
                    const { name, extension } = activeEntry
                    end = extension ? name.lastIndexOf(`.${extension}`) : name.length
                  }
                  setTimeout(() => setInputSelection(input, 0, end))
                }
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  )
}
