import { Modal, SideSheet } from '@douyinfe/semi-ui'
import { ReactNode, useCallback, useMemo, useState } from 'react'
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
  selectedEntryList: IEntry[]
  selectedPath: string
}

interface EntryPickerProps {
  children: ReactNode
  childrenWrapperClassName?: string
  appId: string
  mode: EntryPickerMode.open | EntryPickerMode.save
  type: EntryType.directory | EntryType.file
  multiple?: boolean
  onConfirm: (result: EntryPickerResult) => void
}

export function EntryPicker(props: EntryPickerProps) {

  const {
    children,
    childrenWrapperClassName = '',
    mode,
    appId,
    type,
    multiple = false,
    onConfirm,
  } = props

  const { t } = useTranslation()

  const touchMode = useTouchMode()

  const [pickerShow, setPickerShow] = useState(false)
  const [currentPath, setCurrentPath] = useState('')
  const [selectedEntryList, setSelectedEntryList] = useState<IEntry[]>([])
  const [sideShow, setSideShow] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const selectedPath = useMemo(() => {
    const selectedEntryPath = selectedEntryList.length === 1 ? `/${selectedEntryList[0].name}` : ''
    return `${currentPath}${selectedEntryPath}`
  }, [currentPath, selectedEntryList])

  const { selectorState, matchList } = useMemo(() => {
    const selectorState = {
      isOpenMode: mode === EntryPickerMode.open,
      isSaveMode: mode === EntryPickerMode.save,
      isMultiple: multiple,
      isSingle: !multiple,
      isSelectFile: type === EntryType.file,
      isSelectDirectory: type === EntryType.directory,
      isSelectBoth: !type,
    }
    const matchList = APP_LIST.find(app => app.id === appId)?.matchList || []
    return { selectorState, matchList }
  }, [appId, mode, multiple, type])

  const { disabled, isExtensionMatched } = useMemo(() => {
    const selectedCount = selectedEntryList.length
    const { isMultiple, isSelectDirectory } = selectorState

    const isEnough = type
      ? isSelectDirectory
        ? true
        : isMultiple ? selectedCount > 1 : selectedCount === 1
      : true

    const isTypeMatched = type
      ? selectedEntryList.every((entry) => entry.type === type)
      : true

    const isExtensionMatched = type
      ? isSelectDirectory
        ? selectedEntryList.every(({ extension }) => ['_dir', '_dir_empty'].includes(extension))
        : selectedEntryList.every(({ extension }) => matchList.includes(extension))
      : true

    const disabled = !isEnough || !isTypeMatched

    return { disabled, isExtensionMatched }
  }, [selectorState, type, selectedEntryList, matchList])

  const handleConfirm = useCallback(() => {
    if (disabled) return // avoid double-click call
    onConfirm({
      selectedEntryList,
      selectedPath,
    })
    setPickerShow(false)
  }, [disabled, selectedEntryList, onConfirm, selectedPath])

  const formProps: FormProps = useMemo(() => {
    const { isSaveMode, isSelectDirectory, isSingle } = selectorState
    return {
      touchMode: touchMode,
      disabled: disabled,
      isSelectingPath: (isSaveMode || (isSelectDirectory && isSingle)),
      selectedPath: selectedPath,
      warningShow: !disabled && !isExtensionMatched,
      onCancel: () => setPickerShow(false),
      onConfirm: handleConfirm,
    }
  }, [disabled, handleConfirm, isExtensionMatched, selectedPath, selectorState, setPickerShow, touchMode])

  if (touchMode) {
    return (
      <>
        <div
          className={childrenWrapperClassName}
          onClick={() => setPickerShow(true)}
        >
          {children}
        </div>
        <SideSheet
          placement="bottom"
          closable={false}
          headerStyle={{ padding: '4px 6px' }}
          bodyStyle={{ position: 'relative', padding: 0 }}
          visible={pickerShow}
          height="calc(100% - 3rem)"
          className="gagu-entry-selector-touch"
          style={{ borderTopRightRadius: 10, borderTopLeftRadius: 10 }}
          onCancel={() => setPickerShow(false)}
          title={<Form {...formProps} />}
        >
          <div className="absolute inset-0 border-t overflow-hidden">
            <FileExplorerTouch
              asSelector
              {...{
                show: true,
                sideShow,
                setSideShow,
                isSelectionMode,
                setIsSelectionMode,
              }}
              onCurrentPathChange={setCurrentPath}
              onSelect={setSelectedEntryList}
            />
          </div>
        </SideSheet>
      </>
    )
  }

  return (
    <>
      <div
        className={childrenWrapperClassName}
        onClick={() => setPickerShow(true)}
      >
        {children}
      </div>
      <Modal
        centered
        closable={false}
        width={1020}
        visible={pickerShow}
        className="gagu-entry-selector"
        footer={<Form {...formProps} />}
      >
        <div data-customized-scrollbar>
          <div className="flex items-center justify-between select-none">
            <div className="flex items-center flex-shrink-0">
              <div className="gagu-app-icon w-4 h-4" data-app-id={appId} />
              <span className="ml-1">{t(`app.${appId}`)}</span>
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
              asSelector
              isTopWindow={pickerShow}
              windowSize={{ width: 1020, height: 540 }}
              setWindowTitle={() => {}}
              closeWindow={() => {}}
              onCurrentPathChange={setCurrentPath}
              onSelect={setSelectedEntryList}
              onSelectDoubleConfirm={handleConfirm}
            />
          </div>
        </div>
      </Modal>
    </>
  )
}
