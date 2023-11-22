import { useTranslation } from 'react-i18next'
import { SvgIcon, ToolButton } from '../../components/common'
import { Dropdown } from '@douyinfe/semi-ui'
import { useCallback, useMemo, useState } from 'react'
import { EditMode, Sort, SortType } from '../../types'

export interface IControlBarDisabledMap {
  navBack: boolean
  navForward: boolean
  refresh: boolean
  navToParent: boolean
  createFolder: boolean
  createText: boolean
  rename: boolean
  upload: boolean
  download: boolean
  delete: boolean
  selectAll: boolean
}

interface ControlBarProps {
  windowWidth: number
  disabledMap: IControlBarDisabledMap
  gridMode: boolean
  filterMode: boolean
  filterText: string
  hiddenShow: boolean
  sortType: SortType
  setFilterMode: (open: boolean) => void
  setFilterText: (text: string) => void
  onHiddenShowChange: (show: boolean) => void
  onGridModeChange: (mode: boolean) => void
  onSortTypeChange: (sortType: SortType) => void
  onSideBarClick: () => void
  onNavBack: () => void
  onNavForward: () => void
  onNavRefresh: () => void
  onNavAbort: () => void
  onNavToParent: () => void
  onEdit: (editMode: EditMode) => void
  onUpload: () => void
  onDownload: () => void
  onDelete: () => void
  onSelectAll: () => void
}

export default function ControlBar(props: ControlBarProps) {

  const { t } = useTranslation()

  const {
    windowWidth,
    disabledMap,
    gridMode,
    filterMode,
    filterText,
    hiddenShow,
    sortType,
    setFilterMode,
    setFilterText,
    onHiddenShowChange,
    onGridModeChange,
    onSortTypeChange,
    onSideBarClick,
    onNavBack,
    onNavForward,
    onNavRefresh,
    onNavAbort,
    onNavToParent,
    onEdit,
    onUpload,
    onDownload,
    onDelete,
    onSelectAll,
  } = props

  const [sortVisible, setSortVisible] = useState(false)

  const sortList = useMemo(() => {
    return [
      Sort.default,
      Sort.name,
      Sort.nameDesc,
      Sort.size,
      Sort.sizeDesc,
      Sort.extension,
      Sort.extensionDesc,
      Sort.lastModified,
      Sort.lastModifiedDesc,
    ]
  }, [])

  const cancel = useCallback(() => {
    setFilterMode(false)
    setFilterText('')
  }, [setFilterMode, setFilterText])

  return (
    <>
      <div className="h-10 md:h-8 flex-shrink-0 flex items-center border-b border-gray-100">
        <ToolButton
          title={t`action.location`}
          icon={<SvgIcon.SideBar />}
          onClick={onSideBarClick}
        />
        <div className="mx-1 h-3 border-l" />
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
            onClick={onNavAbort}
          />
        ) : (
          <ToolButton
            title={`${t`action.refresh`} [Shift + R]`}
            icon={<SvgIcon.Refresh />}
            onClick={onNavRefresh}
          />
        )}
        <ToolButton
          title={`${t`action.navToParent`} [Shift + ↑]`}
          icon={<SvgIcon.ArrowUp />}
          disabled={disabledMap.navToParent}
          onClick={onNavToParent}
        />

        <div className="hidden md:block mx-1 h-3 border-l" />

        {windowWidth > 720 && (
          <>
            <ToolButton
              title={`${t`action.newFolder`} [Shift + N]`}
              className="hidden md:flex"
              icon={<SvgIcon.FolderAdd />}
              disabled={disabledMap.createFolder}
              onClick={() => onEdit(EditMode.createFolder)}
            />
            <ToolButton
              title={`${t`action.newTextFile`} [Shift + T]`}
              className="hidden md:flex"
              icon={<SvgIcon.FileAdd />}
              disabled={disabledMap.createText}
              onClick={() => onEdit(EditMode.createText)}
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
              title={`${t`action.selectAll`} [Shift + A]`}
              className="hidden md:flex"
              icon={<SvgIcon.Check />}
              disabled={disabledMap.selectAll}
              onClick={onSelectAll}
            />
            <ToolButton
              title={`${t`action.rename`} [Shift + e]`}
              className="hidden md:flex"
              icon={<SvgIcon.Rename />}
              disabled={disabledMap.rename}
              onClick={() => onEdit(EditMode.rename)}
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

        <div className="flex-grow mx-1 h-3 border-r" />

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
              onClick={() => setFilterMode(true)}
            />
          )}
        </div>

        <div className={`h-full flex items-center ${(windowWidth < 720 && filterMode) ? 'hidden' : ''}`}>
          <ToolButton
            title={`${hiddenShow ? t`action.hideHiddenItems` : t`action.showHiddenItems`} [Shift + H]`}
            icon={hiddenShow ? <SvgIcon.EyeOff /> : <SvgIcon.Eye />}
            onClick={() => onHiddenShowChange(!hiddenShow)}
          />
          <ToolButton
            title={gridMode ? `${t`action.listView`} [Shift + L]` : `${t`action.gridView`} [Shift + G]`}
            icon={gridMode ? <SvgIcon.ViewList /> : <SvgIcon.ViewGrid />}
            onClick={() => onGridModeChange(!gridMode)}
          />
          <ToolButton
            title={t`action.sort`}
            icon={<SvgIcon.Sort />}
            active={sortVisible || sortType !== Sort.default}
            onClick={() => setSortVisible(!sortVisible)}
          />
          <Dropdown
            position="bottomRight"
            spacing={0}
            visible={sortVisible}
            onVisibleChange={setSortVisible}
            onClickOutSide={() => setSortVisible(false)}
            render={(
              <Dropdown.Menu className="w-48">
                {sortList.map(type => {
                  const isActive = type === sortType
                  const isDesc = type.endsWith('Desc')
                  return (
                    <Dropdown.Item
                      key={type}
                      className={`flex items-center ${isActive ? 'text-blue-600' : ''}`}
                      onClick={() => onSortTypeChange(type)}
                    >
                      <span className="flex-shrink-0 inline-block w-6">
                        {isActive ? <SvgIcon.Check /> : undefined}
                      </span>
                      <span className="flex-grow">{t(`action.sort-${type}`)}</span>
                      {type !== Sort.default && (
                        <span className="flex-shrink-0 inline-block">
                          {isDesc ? <SvgIcon.ArrowDown size={12} /> : <SvgIcon.ArrowUp size={12} />}
                        </span>
                      )}
                    </Dropdown.Item>
                  )
                })}

              </Dropdown.Menu>
            )}
          >
            <div className="h-full"></div>
          </Dropdown>
        </div>
      </div>
    </>
  )
}
