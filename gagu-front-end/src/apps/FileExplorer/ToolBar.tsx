import { useTranslation } from 'react-i18next'
import ToolButton from '../../components/ToolButton'
import { SvgIcon } from '../../components/base'

export interface IToolBarDisabledMap {
  navBack: boolean
  navForward: boolean
  refresh: boolean
  backToParentDirectory: boolean
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

  const { t } = useTranslation()

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
      <div className="h-8 flex-shrink-0 flex items-center border-b border-gray-100">
        <ToolButton
          title={`${t`action.backward`} [Shift + ←]`}
          icon={<SvgIcon.ArrowLeft />}
          disabled={disabledMap.navBack}
          onClick={onNavBack}
        />
        <ToolButton
          title={`${t`action.forward`} [Shift + →]`}
          icon={<SvgIcon.ArrowRight />}
          disabled={disabledMap.navForward}
          onClick={onNavForward}
        />
        {disabledMap.refresh ? (
          <ToolButton
            title={t`action.cancel`}
            icon={<SvgIcon.Close />}
            onClick={onAbort}
          />
        ) : (
          <ToolButton
            title={`${t`action.refresh`} [Shift + R]`}
            icon={<SvgIcon.Refresh />}
            onClick={onRefresh}
          />
        )}
        <ToolButton
          title={`${t`action.backToParentDirectory`} [Shift + ↑]`}
          icon={<SvgIcon.ArrowUp />}
          disabled={disabledMap.backToParentDirectory}
          onClick={onBackToTop}
        />

        <div className="hidden md:block mx-2 h-3 border-l" />
        {windowWidth > 720 && (
          <>
            <ToolButton
              title={`${t`action.newFolder`} [Shift + N]`}
              className="hidden md:flex"
              icon={<SvgIcon.FolderAdd />}
              disabled={disabledMap.newDir}
              onClick={onNewDir}
            />
            <ToolButton
              title={`${t`action.newTextFile`} [Shift + T]`}
              className="hidden md:flex"
              icon={<SvgIcon.FileAdd />}
              disabled={disabledMap.newTxt}
              onClick={onNewTxt}
            />
            <ToolButton
              title={`${t`action.upload`} [Shift + U]`}
              className="hidden md:flex"
              icon={<SvgIcon.Upload />}
              onClick={onUpload}
            />
            <ToolButton
              title={`${t`action.download`} [Shift + D]`}
              className="hidden md:flex"
              icon={<SvgIcon.Download />}
              disabled={disabledMap.download}
              onClick={onDownload}
            />
            <ToolButton
              title={`${t`action.rename`} [Shift + e]`}
              className="hidden md:flex"
              icon={<SvgIcon.Rename />}
              disabled={disabledMap.rename}
              onClick={onRename}
            />
            <ToolButton
              title={`${t`action.delete`} [Del]`}
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
            <div className="h-full flex justify-between items-center border-r border-gray-100">
              <input
                autoFocus
                placeholder={t`hint.filter`}
                className="w-full px-2 py-1 text-xs outline-none"
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                onBlur={e => !e.target.value && setFilterMode(false)}
                onKeyUp={e => e.key === 'Escape' && cancel()}
              />
              <ToolButton
                title={t`action.cancel`}
                icon={<SvgIcon.CloseCircle />}
                onClick={cancel}
              />
            </div>
          ) : (
            <ToolButton
              title={`${t`action.filter`} [Shift + F]`}
              icon={<SvgIcon.Filter />}
              disabled={disabledMap.filter}
              onClick={() => setFilterMode(true)}
            />
          )}
        </div>

        <ToolButton
          title={`${t`action.selectAll`} [Shift + A]`}
          icon={<SvgIcon.Check />}
          disabled={disabledMap.selectAll}
          onClick={onSelectAll}
        />
        <ToolButton
          title={`${hiddenShow ? t`action.hideHiddenItems` : t`action.showHiddenItems`} [Shift + H]`}
          icon={hiddenShow ? <SvgIcon.EyeOff /> : <SvgIcon.Eye />}
          onClick={() => setHiddenShow(!hiddenShow)}
        />
        <ToolButton
          title={gridMode ? `${t`action.listView`} [Shift + L]` : `${t`action.gridView`} [Shift + G]`}
          icon={gridMode ? <SvgIcon.ViewList /> : <SvgIcon.ViewGrid />}
          onClick={() => setGridMode(!gridMode)}
        /> 
      </div>
    </>
  )
}
