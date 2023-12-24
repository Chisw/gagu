import { Button, Modal, SideSheet } from '@douyinfe/semi-ui'
import { useCallback, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { entrySelectorEventState, openEventState } from '../states'
import { EntryType, IEntry } from '../types'
import { useTranslation } from 'react-i18next'
import FileExplorer from '../apps/FileExplorer'
import { APP_LIST } from '../apps'
import { SvgIcon } from './common'
import { useTouchMode } from '../hooks'
import FileExplorerTouch from '../apps/FileExplorerTouch'
import { line } from '../utils'

// const entryToTree = (entryList: IRootEntry[], hiddenShow: boolean) => {
//   const treeList: TreeNodeData[] = entryList.map(entry => {
//     const { name, type, hidden } = entry
//     const isFile = type === EntryType.file
//     const path = getEntryPath(entry)
//     return {
//       key: path,
//       label: name,
//       value: path,
//       icon: isFile
//         ? <SvgIcon.File className="mr-1" />
//         : <SvgIcon.Folder className="mr-1" />,
//       isLeaf: isFile,
//       hidden,
//       entry,
//     }
//   }).filter(node => hiddenShow ? true : !node.hidden)
//   return treeList
// }

// const updateTreeData = (list: TreeNodeData[], key: string, children: TreeNodeData[]) => {
//   return list.map((node: TreeNodeData) => {
//     let newNode: TreeNodeData = node
//     if (node.key === key) {
//       newNode = { ...node, children }
//     }
//     if (node.children) {
//       newNode = { ...node, children: updateTreeData(node.children, key, children) }
//     }
//     return newNode
//   })
// }

/*
mode
  - open: multiple?
    - file
    - directory
    - [both]
  - save: single
    - directory & name input
*/

interface FormProps {
  touchMode: boolean
  disabled: boolean
  isSelectingPath: boolean
  selectedPath: string
  warningShow: boolean
  onCancel: () => void
  onConfirm: () => void
}

function Form(props: FormProps) {
  const {
    touchMode,
    disabled,
    isSelectingPath,
    selectedPath,
    warningShow,
    onCancel,
    onConfirm,
  } = props

  const { t } = useTranslation()

  return (
    <div className="py-1">
      {isSelectingPath && (
        <div
          className={line(`
            p-2 bg-gray-100 rounded flex items-center border border-gray-200
            dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-600
            ${touchMode ? 'mb-1 text-xs' : 'mb-2'}
          `)}
        >
          <SvgIcon.Folder className="flex-shrink-0" />
          <div className="flex-grow ml-1 break-all text-left">{selectedPath}</div>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div className="w-1/2">

        </div>
        <div className="flex-shrink-0">
          <Button
            style={{ margin: 0 }}
            onClick={() => onCancel()}
          >
            {t`action.cancel`}
          </Button>
          <Button
            theme="solid"
            className={`ml-1 md:ml-2 ${touchMode ? 'w-24' : 'w-32'}`}
            disabled={disabled}
            onClick={onConfirm}
          >
            <div className="flex items-center">
              <div className={`transition-all duration-200 overflow-hidden ${warningShow ? 'w-5' : 'w-0'}`}>
                <SvgIcon.Warning />
              </div>
              <span>{t`action.open`}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function EntrySelector() {

  const { t } = useTranslation()

  const [entrySelectorEvent, setEntrySelectorEvent] = useRecoilState(entrySelectorEventState)
  const [, setOpenEvent] = useRecoilState(openEventState)

  const touchMode = useTouchMode()

  const [currentPath, setCurrentPath] = useState('')
  const [selectedEntryList, setSelectedEntryList] = useState<IEntry[]>([])
  const [sideShow, setSideShow] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const selectorShow = useMemo(() => !!entrySelectorEvent, [entrySelectorEvent])

  const selectedPath = useMemo(() => {
    const selectedEntryPath = selectedEntryList.length === 1 ? `/${selectedEntryList[0].name}` : ''
    return `${currentPath}${selectedEntryPath}`
  }, [currentPath, selectedEntryList])

  const { transaction, appId, type, selectorState, matchList } = useMemo(() => {
    const { transaction, mode, appId, multiple = false, type } = entrySelectorEvent || {}
    const selectorState = {
      isOpenMode: mode === 'open',
      isSaveMode: mode === 'save',
      isMultiple: multiple,
      isSingle: !multiple,
      isSelectFile: type === EntryType.file,
      isSelectDirectory: type === EntryType.directory,
      isSelectBoth: !type,
    }
    const matchList = APP_LIST.find(app => app.id === appId)?.matchList || []
    return { transaction, appId, type, selectorState, matchList }
  }, [entrySelectorEvent])

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
    if (disabled || !transaction) return // disabled: avoid double click
    if (appId && selectedEntryList) {
      setOpenEvent({
        transaction,
        appId,
        entryList: selectedEntryList,
        extraData: { selectedPath },
      })
      setEntrySelectorEvent(null)
    }
  }, [disabled, transaction, appId, selectedEntryList, selectedPath, setOpenEvent, setEntrySelectorEvent])

  const formProps: FormProps = useMemo(() => {
    const { isSaveMode, isSelectDirectory, isSingle } = selectorState
    return {
      touchMode: touchMode,
      disabled: disabled,
      isSelectingPath: (isSaveMode || (isSelectDirectory && isSingle)),
      selectedPath: selectedPath,
      warningShow: !disabled && !isExtensionMatched,
      onCancel: () => setEntrySelectorEvent(null),
      onConfirm: handleConfirm,
    }
  }, [disabled, handleConfirm, isExtensionMatched, selectedPath, selectorState, setEntrySelectorEvent, touchMode])

  if (touchMode) {
    return (
      <>
        <SideSheet
          placement="bottom"
          closable={false}
          headerStyle={{ padding: '4px 6px' }}
          bodyStyle={{ position: 'relative', padding: 0 }}
          visible={selectorShow}
          height="calc(100% - 3rem)"
          className="gagu-entry-selector-touch"
          style={{ borderTopRightRadius: 10, borderTopLeftRadius: 10 }}
          onCancel={() => setEntrySelectorEvent(null)}
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
      <Modal
        centered
        closable={false}
        width={1020}
        visible={selectorShow}
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
              isTopWindow={selectorShow}
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
