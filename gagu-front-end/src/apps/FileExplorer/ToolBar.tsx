import ToolButton from '../../components/ToolButton'
import { SvgIcon } from '../../components/base'

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
  windowWidth: number
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
  onUpload: () => void
  onDownload: () => void
  onRename: () => void
  onDelete: () => void
  onSelectAll: () => void
}

export default function ToolBar(props: ToolBarProps) {

  const {
    windowWidth,
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
    onUpload,
    onDownload,
    onRename,
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
          icon={<SvgIcon.ArrowLeft />}
          disabled={disabledMap.navBack}
          onClick={onNavBack}
        />
        <ToolButton
          title="前进 [Shift + →]"
          icon={<SvgIcon.ArrowRight />}
          disabled={disabledMap.navForward}
          onClick={onNavForward}
        />
        {disabledMap.refresh ? (
          <ToolButton
            title="停止"
            icon={<SvgIcon.Close />}
            onClick={onAbort}
          />
        ) : (
          <ToolButton
            title="刷新 [Shift + R]"
            icon={<SvgIcon.Refresh />}
            onClick={onRefresh}
          />
        )}
        <ToolButton
          title="上级目录 [Shift + ↑]"
          icon={<SvgIcon.ArrowUp />}
          disabled={disabledMap.backToTop}
          onClick={onBackToTop}
        />

        <div className="hidden md:block mx-2 h-3 border-l" />
        {windowWidth > 720 && (
          <>
            <ToolButton
              title="新建文件夹 [Shift + N]"
              className="hidden md:flex"
              icon={<SvgIcon.FolderAdd />}
              disabled={disabledMap.newDir}
              onClick={onNewDir}
            />
            <ToolButton
              title="新建文本文件 [Shift + T]"
              className="hidden md:flex"
              icon={<SvgIcon.FileAdd />}
              disabled={disabledMap.newTxt}
              onClick={onNewTxt}
            />
            <ToolButton
              title="上传 [Shift + U]"
              className="hidden md:flex"
              icon={<SvgIcon.Upload />}
              onClick={onUpload}
            />
            <ToolButton
              title="下载 [Shift + D]"
              className="hidden md:flex"
              icon={<SvgIcon.Download />}
              disabled={disabledMap.download}
              onClick={onDownload}
            />
            {/* <ToolButton
              title="收藏 [Shift + S]"
              className="hidden md:flex"
              icon={<SvgIcon.Star />}
            /> */}
            <ToolButton
              title="重命名 [Shift + E]"
              className="hidden md:flex"
              icon={<SvgIcon.Rename />}
              disabled={disabledMap.rename}
              onClick={onRename}
            />
            <ToolButton
              title="删除 [Del]"
              className="hidden md:flex"
              icon={<SvgIcon.Delete />}
              disabled={disabledMap.delete}
              onClick={onDelete}
            />
          </>
        )}

        <div className="flex-grow mx-2 h-3 border-r" />

        <div className={`${filterMode ? 'w-40' : 'w-8'} h-full transition-all duration-200`}>
          {filterMode ? (
            <div className="h-full flex justify-between items-center border-r">
              <input
                autoFocus
                placeholder="在当前目录筛选"
                className="w-full px-2 py-1 text-xs outline-none"
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                onBlur={e => !e.target.value && setFilterMode(false)}
                onKeyUp={e => e.key === 'Escape' && cancel()}
              />
              <ToolButton
                title="取消"
                icon={<SvgIcon.CloseCircle />}
                onClick={cancel}
              />
            </div>
          ) : (
            <ToolButton
              title="筛选 [Shift + F]"
              icon={<SvgIcon.Filter />}
              disabled={disabledMap.filter}
              onClick={() => setFilterMode(true)}
            />
          )}
        </div>

        <ToolButton
          title="全选 [Shift + A]"
          icon={<SvgIcon.Check />}
          disabled={disabledMap.selectAll}
          onClick={onSelectAll}
        />
        <ToolButton
          title={`${hiddenShow ? '不' : ''}显示隐藏项 [Shift + H]`}
          icon={hiddenShow ? <SvgIcon.EyeOff /> : <SvgIcon.Eye />}
          onClick={() => setHiddenShow(!hiddenShow)}
        />
        <ToolButton
          title={gridMode ? '显示为列表 [Shift + L]' : '显示为图标 [Shift + G]'}
          icon={gridMode ? <SvgIcon.ViewList /> : <SvgIcon.ViewGrid />}
          onClick={() => setGridMode(!gridMode)}
        /> 
      </div>
    </>
  )
}
