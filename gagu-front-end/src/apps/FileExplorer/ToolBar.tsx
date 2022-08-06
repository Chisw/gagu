import {
  ArrowUp16,
  Checkmark16,
  ArrowLeft16,
  ArrowRight16,
  Download16,
  Edit16,
  Upload16,
  Filter16,
  FolderAdd16,
  Grid16,
  Renew16,
  Star16,
  TrashCan16,
  View16,
  List16,
  ViewOff16,
  DocumentAdd16,
  Close16,
} from '@carbon/icons-react'
import { Button, InputGroup } from '@blueprintjs/core'
import ToolButton from '../../components/ToolButton'

export interface IToolBarDisabledMap {
  navBack: boolean
  navForward: boolean
  refresh: boolean
  backToTop: boolean
  newDir: boolean
  newTxt: boolean
  rename: boolean
  upload: boolean
  download: boolean
  store: boolean
  delete: boolean
  filter: boolean
  selectAll: boolean
  showHidden: boolean
  gridMode: boolean
}

interface ToolBarProps {
  disabledMap: IToolBarDisabledMap
  gridMode: boolean
  filterMode: boolean
  filterText: string
  hiddenShow: boolean
  setGridMode: (mode: boolean) => void
  setFilterMode: (open: boolean) => void
  setFilterText: (text: string) => void
  setHiddenShow: (show: boolean) => void
  onNavBack: () => void
  onNavForward: () => void
  onRefresh: () => void
  onAbort: () => void
  onBackToTop: () => void
  onNewDir: () => void
  onNewTxt: () => void
  onRename: () => void
  onUpload: () => void
  onDownload: () => void
  onDelete: () => void
  onSelectAll: () => void
}

export default function ToolBar(props: ToolBarProps) {

  const {
    disabledMap,
    gridMode,
    filterMode,
    filterText,
    hiddenShow,
    setGridMode,
    setFilterMode,
    setFilterText,
    setHiddenShow,
    onNavBack,
    onNavForward,
    onRefresh,
    onAbort,
    onBackToTop,
    onNewDir,
    onNewTxt,
    onRename,
    onUpload,
    onDownload,
    onDelete,
    onSelectAll,
  } = props

  const cancel = () => {
    setFilterMode(false)
    setFilterText('')
  }

  return (
    <>
      <div className="h-8 flex-shrink-0 flex items-center border-b">
        <ToolButton
          title="后退 [Shift + ←]"
          icon={<ArrowLeft16 />}
          disabled={disabledMap.navBack}
          onClick={onNavBack}
        />
        <ToolButton
          title="前进 [Shift + →]"
          icon={<ArrowRight16 />}
          disabled={disabledMap.navForward}
          onClick={onNavForward}
        />
        {disabledMap.refresh ? (
          <ToolButton
            title=""
            icon={<Close16 />}
            onClick={onAbort}
          />
        ) : (
          <ToolButton
            title="刷新 [Shift + R]"
            icon={<Renew16 />}
            onClick={onRefresh}
          />
        )}
        <ToolButton
          title="上级目录 [Shift + ↑]"
          icon={<ArrowUp16 />}
          disabled={disabledMap.backToTop}
          onClick={onBackToTop}
        />

        <div className="mx-2 h-3 border-l" />

        <ToolButton
          title="新建文件夹 [Shift + N]"
          icon={<FolderAdd16 />}
          disabled={disabledMap.newDir}
          onClick={onNewDir}
        />
        <ToolButton
          title="新建文本文件 [Shift + T]"
          icon={<DocumentAdd16 />}
          disabled={disabledMap.newTxt}
          onClick={onNewTxt}
        />
        <ToolButton
          title="重命名 [Shift + E]"
          icon={<Edit16 />}
          disabled={disabledMap.rename}
          onClick={onRename}
        />
        <ToolButton
          title="上传 [Shift + U]"
          icon={<Upload16 />}
          onClick={onUpload}
        />
        <ToolButton
          title="下载 [Shift + D]"
          icon={<Download16 />}
          disabled={disabledMap.download}
          onClick={onDownload}
        />
        <ToolButton
          title="收藏 [Shift + S]"
          icon={<Star16 />}
        />
        <ToolButton
          title="删除 [Del]"
          icon={<TrashCan16 />}
          disabled={disabledMap.delete}
          onClick={onDelete}
        />

        <div className="flex-grow mx-2 h-3 border-r" />

        <div className={`${filterMode ? 'w-40' : 'w-8'} h-full transition-all duration-200`}>
          {filterMode ? (
            <div className="px-1 h-full flex items-center">
              <InputGroup
                small
                autoFocus
                placeholder="在当前目录筛选"
                leftIcon={(
                  <span className="bp3-icon text-gray-400">
                    <Filter16 />
                  </span>
                )}
                rightElement={(
                  <Button
                    minimal
                    icon="cross"
                    onClick={cancel}
                  />
                )}
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                onBlur={e => !e.target.value && setFilterMode(false)}
                onKeyUp={e => e.key === 'Escape' && cancel()}
              />
            </div>
          ) : (
            <ToolButton
              title="筛选 [Shift + F]"
              icon={<Filter16 />}
              disabled={disabledMap.filter}
              onClick={() => setFilterMode(true)}
            />
          )}
        </div>

        <ToolButton
          title="全选 [Shift + A]"
          icon={<Checkmark16 />}
          disabled={disabledMap.selectAll}
          onClick={onSelectAll}
        />
        <ToolButton
          title={`${hiddenShow ? '不' : ''}显示隐藏项 [Shift + H]`}
          icon={hiddenShow ? <ViewOff16 /> : <View16 />}
          onClick={() => setHiddenShow(!hiddenShow)}
        />
        <ToolButton
          title={gridMode ? '显示为列表 [Shift + L]' : '显示为图标 [Shift + G]'}
          icon={gridMode ? <List16 /> : <Grid16 />}
          onClick={() => setGridMode(!gridMode)}
        /> 
      </div>
    </>
  )
}
