import { Modal, SideSheet } from '@douyinfe/semi-ui'
import { useCallback, useMemo, useState } from 'react'
import { EntryType, IEntry } from '../../types'
import { useTranslation } from 'react-i18next'
import FileExplorer from '../../apps/FileExplorer'
import { APP_LIST } from '../../apps'
import { useTouchMode } from '../../hooks'
import FileExplorerTouch from '../../apps/FileExplorerTouch'
import Form, { FormProps } from './Form'

export enum EntryPickerMode {
  open = 'open',
  save = 'save',
}

interface EntryPickerResult {
  pickedEntryList: IEntry[]
  pickedPath: string
}

interface EntryPickerProps {
  show: boolean
  appId: string
  mode: EntryPickerMode.open | EntryPickerMode.save
  type: EntryType.directory | EntryType.file
  title?: string
  multiple?: boolean
  onConfirm: (result: EntryPickerResult) => void
  onCancel: () => void
}

export function EntryPicker(props: EntryPickerProps) {

  const {
    show,
    mode,
    appId,
    type,
    title,
    multiple = false,
    onConfirm,
    onCancel,
  } = props

  const { t } = useTranslation()

  const touchMode = useTouchMode()

  const [currentPath, setCurrentPath] = useState('')
  const [pickedEntryList, setPickedEntryList] = useState<IEntry[]>([])

  const pickedPath = useMemo(() => {
    const selectedEntryPath = pickedEntryList.length === 1 ? `/${pickedEntryList[0].name}` : ''
    return `${currentPath}${selectedEntryPath}`
  }, [currentPath, pickedEntryList])

  const { pickerState, matchList } = useMemo(() => {
    const pickerState = {
      isOpenMode: mode === EntryPickerMode.open,
      isSaveMode: mode === EntryPickerMode.save,
      isMultiple: multiple,
      isSingle: !multiple,
      isPickingFile: type === EntryType.file,
      isPickingDirectory: type === EntryType.directory,
      isPickingBoth: !type,
    }
    const matchList = APP_LIST.find(app => app.id === appId)?.matchList || []
    return { pickerState, matchList }
  }, [appId, mode, multiple, type])

  const { disabled, isExtensionMatched } = useMemo(() => {
    const pickedCount = pickedEntryList.length
    const { isMultiple, isPickingDirectory } = pickerState

    const isEnough = type
      ? isPickingDirectory
        ? true
        : isMultiple ? pickedCount > 1 : pickedCount === 1
      : true

    const isTypeMatched = type
      ? pickedEntryList.every((entry) => entry.type === type)
      : true

    const isExtensionMatched = type
      ? isPickingDirectory
        ? pickedEntryList.every(({ extension }) => ['_dir', '_dir_empty'].includes(extension))
        : pickedEntryList.every(({ extension }) => matchList.includes(extension))
      : true

    const disabled = !isEnough || !isTypeMatched

    return { disabled, isExtensionMatched }
  }, [pickerState, type, pickedEntryList, matchList])

  const handleConfirm = useCallback(() => {
    if (disabled) return // avoid double-click call
    onConfirm({
      pickedEntryList: pickedEntryList,
      pickedPath,
    })
  }, [disabled, onConfirm, pickedEntryList, pickedPath])

  const formProps: FormProps = useMemo(() => {
    const { isSaveMode, isPickingDirectory, isSingle } = pickerState
    return {
      touchMode: touchMode,
      disabled: disabled,
      isPickingPath: (isSaveMode || (isPickingDirectory && isSingle)),
      pickedPath,
      warningShow: !disabled && !isExtensionMatched,
      onConfirm: handleConfirm,
      onCancel,
    }
  }, [pickerState, touchMode, disabled, pickedPath, isExtensionMatched, handleConfirm, onCancel])

  if (touchMode) {
    return (
      <>
        <SideSheet
          placement="bottom"
          closable={false}
          headerStyle={{ padding: '4px 6px' }}
          bodyStyle={{ position: 'relative', padding: 0 }}
          visible={show}
          height="calc(100% - 1rem)"
          className="gagu-entry-picker-touch gagu-sync-popstate-overlay"
          style={{ borderTopRightRadius: 10, borderTopLeftRadius: 10 }}
          onCancel={onCancel}
          title={(
            <div className="py-1">
              <div className="mb-2 flex items-center flex-shrink-0">
                <div className="gagu-app-icon w-4 h-4" data-app-id={appId} />
                <span className="ml-1 text-xs">{title || t(`app.${appId}`)}</span>
              </div>
              <Form {...formProps} />
            </div>
          )}
        >
          <div className="absolute inset-0 border-t overflow-hidden">
            <FileExplorerTouch
              show
              asEntryPicker
              onCurrentPathChange={setCurrentPath}
              onPick={setPickedEntryList}
            />
          </div>
        </SideSheet>
      </>
    )
  }

  return (
    <>
      <Modal
        centered
        closable={false}
        width={1020}
        visible={show}
        className="gagu-entry-picker"
        footer={<Form {...formProps} />}
      >
        <div data-customized-scrollbar>
          <div className="flex items-center justify-between select-none">
            <div className="flex items-center flex-shrink-0">
              <div className="gagu-app-icon w-4 h-4" data-app-id={appId} />
              <span className="ml-1">{title || t(`app.${appId}`)}</span>
            </div>
            <div className="ml-3 flex">
              {matchList.map((extension) => (
                <div
                  key={extension}
                  className="ml-1 px-1 text-xs text-gray-400 font-din bg-gray-100 rounded uppercase dark:bg-zinc-500 dark:text-zinc-300"
                >
                  {extension}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 relative h-[540px] overflow-y-auto border bg-gray-100 bg-opacity-50 dark:bg-black dark:border-zinc-600">
            <FileExplorer
              asEntryPicker
              isTopWindow={show}
              windowSize={{ width: 1020, height: 540 }}
              setWindowTitle={() => {}}
              closeWindow={() => {}}
              onCurrentPathChange={setCurrentPath}
              onPick={setPickedEntryList}
              onPickDoubleConfirm={handleConfirm}
            />
          </div>
        </div>
      </Modal>
    </>
  )
}
