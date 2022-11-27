import { Button, Modal, Tree } from '@douyinfe/semi-ui'
import { TreeNodeData } from '@douyinfe/semi-ui/lib/es/tree'
import { useCallback, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { FsApi } from '../../api'
import { SvgIcon } from '../../components/base'
import { useFetch } from '../../hooks'
import { entrySelectorState, openOperationState, rootInfoState } from '../../states'
import { EntryType, IEntry, IRootEntry } from '../../types'
import { entrySorter, getEntryPath } from '../../utils'

const entryToTree = (entryList: IRootEntry[], hiddenShow: boolean) => {
  const treeList: TreeNodeData[] = entryList.map(entry => {
    const { name, label, type, hidden } = entry
    const isFile = type === EntryType.file
    const path = getEntryPath(entry)
    return {
      key: path,
      label: label || name,
      value: path,
      icon: isFile
        ? <SvgIcon.File className="mr-1" />
        : <SvgIcon.Folder className="mr-1" />,
      isLeaf: isFile,
      hidden,
      entry,
    }
  }).filter(node => hiddenShow ? true : !node.hidden)
  return treeList
}

const updateTreeData = (list: TreeNodeData[], key: string, children: TreeNodeData[]) => {
  return list.map((node: TreeNodeData) => {
      let newNode: TreeNodeData = node
      if (node.key === key) {
        newNode = { ...node, children }
      }
      if (node.children) {
        newNode = { ...node, children: updateTreeData(node.children, key, children) }
      }
      return newNode
    })
  }

export default function EntrySelector() {

  const [entrySelector, setEntrySelector] = useRecoilState(entrySelectorState)
  const [rootInfo] = useRecoilState(rootInfoState)
  const [, setOpenOperation] = useRecoilState(openOperationState)

  const [treeData, setTreeData] = useState<TreeNodeData[]>([])
  const [hiddenShow] = useState(false)
  const [activeEntry, setActiveEntry] = useState<IEntry | null>(null)

  const { fetch: getEntryList } = useFetch(FsApi.getEntryList)

  useEffect(() => {
    setTreeData(entryToTree(rootInfo.rootEntryList, hiddenShow))
  }, [rootInfo, hiddenShow])

  const handleLoadData = useCallback(async ({ key }) => {
    const res = await getEntryList(key)
    if (res.success) {
      const list = updateTreeData(treeData, key, entryToTree(res.entryList.sort(entrySorter), hiddenShow))
      setTreeData(list)
    }
  }, [treeData, getEntryList, hiddenShow])

  const handleConfirm = useCallback(() => {
    const { app } = entrySelector
    if (app && activeEntry) {
      setOpenOperation({
        app,
        matchedEntryList: [activeEntry],
        activeEntryIndex: 0,
      })
      setEntrySelector({ show: false })
    }
  }, [activeEntry, entrySelector, setOpenOperation, setEntrySelector])

  return (
    <>
      <Modal
        centered
        title="请选择"
        closable={false}
        width={500}
        visible={entrySelector.show}
        footer={(
          <div className="flex">
            <Button
              className="w-full"
              style={{ margin: 0 }}
              onClick={() => setEntrySelector({ show: false })}
            >
              取消
            </Button>
            <Button
              theme="solid"
              className="w-full"
              disabled={!activeEntry}
              onClick={handleConfirm}
            >
              确定
            </Button>
          </div>
        )}
      >
        <div className="max-h-60vh min-h-30vh overflow-y-auto">
          <Tree
            labelEllipsis
            // filterTreeNode
            // showFilteredOnly
            onChangeWithObject
            multiple={entrySelector.multiple}
            treeData={treeData}
            loadData={handleLoadData}
            onChange={(value) => {
              const entry = (value as any as { entry: IEntry }).entry
              setActiveEntry(entry)
            }}
          />
        </div>
      </Modal>
    </>
  )
}
