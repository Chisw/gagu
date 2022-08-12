import ToolButton from '../../components/ToolButton'
import RemixIcon from '../../img/remixicon'

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
          icon={<RemixIcon.ArrowLeft />}
          disabled={disabledMap.navBack}
          onClick={onNavBack}
        />
        <ToolButton
          title="前进 [Shift + →]"
          icon={<RemixIcon.ArrowRight />}
          disabled={disabledMap.navForward}
          onClick={onNavForward}
        />
        {disabledMap.refresh ? (
          <ToolButton
            title="停止"
            icon={<RemixIcon.Close />}
            onClick={onAbort}
          />
        ) : (
          <ToolButton
            title="刷新 [Shift + R]"
            icon={<RemixIcon.Refresh />}
            onClick={onRefresh}
          />
        )}
        <ToolButton
          title="上级目录 [Shift + ↑]"
          icon={<RemixIcon.ArrowUp />}
          disabled={disabledMap.backToTop}
          onClick={onBackToTop}
        />

        <div className="mx-2 h-3 border-l" />

        <ToolButton
          title="新建文件夹 [Shift + N]"
          icon={<RemixIcon.FolderAdd />}
          disabled={disabledMap.newDir}
          onClick={onNewDir}
        />
        <ToolButton
          title="新建文本文件 [Shift + T]"
          icon={<RemixIcon.FileAdd />}
          disabled={disabledMap.newTxt}
          onClick={onNewTxt}
        />
        <ToolButton
          title="重命名 [Shift + E]"
          icon={<RemixIcon.Edit />}
          disabled={disabledMap.rename}
          onClick={onRename}
        />
        <ToolButton
          title="上传 [Shift + U]"
          icon={<RemixIcon.Upload />}
          onClick={onUpload}
        />
        <ToolButton
          title="下载 [Shift + D]"
          icon={<RemixIcon.Download />}
          disabled={disabledMap.download}
          onClick={onDownload}
        />
        <ToolButton
          title="收藏 [Shift + S]"
          icon={<RemixIcon.Star />}
        />
        <ToolButton
          title="删除 [Del]"
          icon={<RemixIcon.Delete />}
          disabled={disabledMap.delete}
          onClick={onDelete}
        />

        <div className="flex-grow mx-2 h-3 border-r" />

        <div className={`${filterMode ? 'w-40' : 'w-8'} h-full transition-all duration-200`}>
          {filterMode ? (
            <div className="px-1 h-full flex justify-center items-center border-r">
              <input
                autoFocus
                placeholder="在当前目录筛选"
                className="max-w-full text-xs outline-none"
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                onBlur={e => !e.target.value && setFilterMode(false)}
                onKeyUp={e => e.key === 'Escape' && cancel()}
              />
              <ToolButton
                title="取消"
                icon={<RemixIcon.Close />}
                onClick={cancel}
              />
            </div>
          ) : (
            <ToolButton
              title="筛选 [Shift + F]"
              icon={<RemixIcon.Filter />}
              disabled={disabledMap.filter}
              onClick={() => setFilterMode(true)}
            />
          )}
        </div>

        <ToolButton
          title="全选 [Shift + A]"
          icon={<RemixIcon.Check />}
          disabled={disabledMap.selectAll}
          onClick={onSelectAll}
        />
        <ToolButton
          title={`${hiddenShow ? '不' : ''}显示隐藏项 [Shift + H]`}
          icon={hiddenShow ? <RemixIcon.EyeOff /> : <RemixIcon.Eye />}
          onClick={() => setHiddenShow(!hiddenShow)}
        />
        <ToolButton
          title={gridMode ? '显示为列表 [Shift + L]' : '显示为图标 [Shift + G]'}
          icon={gridMode ? <RemixIcon.ViewList /> : <RemixIcon.ViewGrid />}
          onClick={() => setGridMode(!gridMode)}
        /> 
      </div>
    </>
  )
}
