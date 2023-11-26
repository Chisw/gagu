import { Button, Modal, SideSheet } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { entrySelectorOperationState, openOperationState } from '../states'
import { IEntry } from '../types'
import { useTranslation } from 'react-i18next'
import FileExplorer from '../apps/FileExplorer'
import { APP_LIST } from '../apps'
import { SvgIcon } from './common'
import { useTouchMode } from '../hooks'
import FileExplorerTouch from '../apps/FileExplorerTouch'

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

export function EntrySelector() {

  const { t } = useTranslation()

  const [entrySelectorOperation, setEntrySelectorOperation] = useRecoilState(entrySelectorOperationState)
  const [, setOpenOperation] = useRecoilState(openOperationState)

  const touchMode = useTouchMode()

  const [selectedEntryList, setSelectedEntryList] = useState<IEntry[]>([])
  const [sideShow, setSideShow] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const selectorShow = useMemo(() => !!entrySelectorOperation, [entrySelectorOperation])

  const { appId, multiple, type, matchList } = useMemo(() => {
    const { appId, multiple = false, type = '' } = entrySelectorOperation || {}
    const matchList = APP_LIST.find(app => app.id === appId)?.matchList || []
    return { appId, multiple, type, matchList }
  }, [entrySelectorOperation])

  const { disabled, isExtensionMatched } = useMemo(() => {
    const selectedCount = selectedEntryList.length
    const isEnough = multiple ? selectedCount > 0 : selectedCount === 1
    const isTypeMatched = type ? selectedEntryList.every((entry) => entry.type === type) : true
    const disabled = !isEnough || !isTypeMatched
    const isExtensionMatched = selectedEntryList.every(({ extension }) => matchList.includes(extension))
    return { disabled, isExtensionMatched }
  }, [multiple, type, selectedEntryList, matchList])

  const handleConfirm = useCallback(() => {
    if (!disabled && appId && selectedEntryList) {
      setOpenOperation({ appId, entryList: selectedEntryList })
      setEntrySelectorOperation(null)
    }
  }, [disabled, appId, selectedEntryList, setOpenOperation, setEntrySelectorOperation])

  useEffect(() => {
    setSideShow(false)
  }, [selectorShow])

  const Actions = () => (
    <div className="flex justify-between items-center">
      <div>

      </div>
      <div>
        <Button
          style={{ margin: 0 }}
          onClick={() => setEntrySelectorOperation(null)}
        >
          {t`action.cancel`}
        </Button>
        <Button
          theme="solid"
          className={`ml-1 md:ml-2 ${touchMode ? '' : 'w-32'}`}
          disabled={disabled}
          onClick={handleConfirm}
        >
          <div className="flex items-center">
            <div className={`transition-all duration-200 overflow-hidden ${!disabled && !isExtensionMatched ? 'w-5' : 'w-0'}`}>
              <SvgIcon.Warning />
            </div>
            <span>{t`action.open`}</span>
          </div>
        </Button>
      </div>
    </div>
  )

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
          style={{ borderTopRightRadius: 10, borderTopLeftRadius: 10 }}
          onCancel={() => setEntrySelectorOperation(null)}
          title={<Actions />}
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
        footer={<Actions />}
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
                  className="ml-1 px-1 text-xs text-gray-400 font-din bg-gray-100 rounded uppercase"
                >
                  {extension}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 relative h-[540px] overflow-y-auto border bg-gray-100 bg-opacity-50">
            <FileExplorer
              asSelector
              isTopWindow={selectorShow}
              windowSize={{ width: 1020, height: 540 }}
              setWindowTitle={() => {}}
              onClose={() => {}}
              onSelect={setSelectedEntryList}
              onSelectConfirm={handleConfirm}
            />
          </div>
        </div>
      </Modal>
    </>
  )
}
