
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EmptyPanel } from '../../components/common'
import { getMatchedApp, getIsSameEntry, line, getEntryBound, getBoundStyle } from '../../utils'
import ControlBar from '../FileExplorer/ControlBar'
import StatusBar from '../FileExplorer/StatusBar'
import EntryNodeTouch from './EntryNodeTouch'
import SelectionMenu from './SelectionMenu'
import Side from './Side'
import { useBrowserWindowSize, useFileExplorer } from '../../hooks'
import { EntryPicker, SharingModal } from '../../components'
import { openEventState } from '../../states'
import { useRecoilState } from 'recoil'
import { AppId, EventTransaction, ExplorerPickProps, IBoundedEntry, IVirtualBox, IVirtualContainer } from '../../types'
import { EntryType, IEntry } from '@shared'
import EntryNameDialog from './EntryNameDialog'
import { useNavigate } from 'react-router'
import { Toast } from '@douyinfe/semi-ui'
import { useTranslation } from 'react-i18next'
import GoToPathDialog from '../FileExplorer/GoToPathDialog'
import { useVirtualizer } from '@tanstack/react-virtual'
import { findIndex } from 'lodash-es'

const BOTTOM_MENU_PADDING = 144

const getColCount = (containerWidth: number) => {
  const ranges = [0, 640, 768, 1024, 1280, 1536, 1792, 2048, 2304, 2560, 2816, Infinity]
  const rangeIndex = findIndex(ranges, (val, i) => containerWidth >= val && containerWidth < ranges[i + 1])
  return [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14][rangeIndex]
}

interface FileExplorerTouchProps extends ExplorerPickProps {
  visible: boolean
  activeAppId?: string
  setIsSideOrSelectionMenuShow?: (visible: boolean) => void
  onPopState?: () => void
}

export default function FileExplorerTouch(props: FileExplorerTouchProps) {

  const {
    visible,
    asEntryPicker = false,
    onCurrentPathChange = () => {},
    onPick = () => {},
    activeAppId = '',
    setIsSideOrSelectionMenuShow = () => {},
    onPopState = () => {},
  } = props

  const navigate = useNavigate()
  const { t } = useTranslation()

  const { width: browserWindowWidth } = useBrowserWindowSize()

  const [, setOpenEvent] = useRecoilState(openEventState)

  const [sideVisible, setSideVisible] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [activeEntry, setActiveEntry] = useState<IEntry | null>(null)

  const containerRef = useRef(null)

  const {
    kiloSize,
    disabledMap, supportThumbnail,
    currentPath, currentRootEntry,
    querying, sizeQuerying, deleting,
    entryList, rootEntryList, favoriteRootEntryList, sharingEntryList,
    isEntryListEmpty, visitHistory,
    folderCount, fileCount,
    editMode, setEditMode,
    filterMode, setFilterMode,
    filterText, setFilterText,
    hiddenVisible, handleHiddenShowChange,
    gridMode, handleGridModeChange,
    sortType, handleSortChange,
    selectedEntryList, setSelectedEntryList,
    sharingModalShow, setSharingModalShow,
    movementEntryPickerShow, setMovementEntryPickerShow,
    goToPathDialogShow, setGoToPathDialogShow,
    clipboardData, handleClipboardAdd, handleClipboardPaste,
    handleSelectAll, handleDirectorySizeUpdate,
    handleDirectoryOpen, handleGoFullPath,
    handleNavBack, handleNavForward, handleNavRefresh, handleNavAbort, handleNavToParent,
    handleUploadClick, handleDownloadClick,
    handleShareClick, handleFavoriteClick, handleMove, handleDeleteClick,
  } = useFileExplorer({ containerRef })

  const {
    virtualContainer,
    virtualBox,
  } = useMemo(() => {
    const padding = 4
    const marginX = gridMode ? 4 : 0
    const marginY = gridMode ? 4 : 0
    const safeContainerWidth = browserWindowWidth - marginX * 2 - padding * 2

    const cols = gridMode
      ? getColCount(browserWindowWidth)
      : 1

    const width = safeContainerWidth / cols - marginX
    const height = gridMode ? 120 : 80

    const rows = gridMode
      ? Math.ceil(entryList.length / cols)
      : entryList.length

    const virtualContainer: IVirtualContainer = { padding, rows, cols }
    const virtualBox: IVirtualBox = { width, height, marginX, marginY }

    return {
      virtualContainer,
      virtualBox,
    }
  }, [browserWindowWidth, gridMode, entryList])

  const boundedEntryList = useMemo(() => {
    return entryList.map((entry, entryIndex) => {
      const bound = getEntryBound(entryIndex, virtualContainer, virtualBox)
      return { ...entry, bound } as IBoundedEntry
    })
  }, [entryList, virtualContainer, virtualBox])

  const virtualizer = useVirtualizer({
    count: virtualContainer.rows,
    getScrollElement: () => containerRef.current,
    estimateSize: () => virtualBox.height + virtualBox.marginY,
    overscan: 3,
  })

  const handleEntryClick = useCallback((entry: IEntry) => {
    if (isSelectionMode) {
      let list = [...selectedEntryList]
      if (list.find(e => getIsSameEntry(e, entry))) {
        list = list.filter(e => !getIsSameEntry(e, entry))
      } else {
        list.push(entry)
      }
      setSelectedEntryList(list)
      return
    }

    if (entry.type === EntryType.directory) {
      handleDirectoryOpen(entry)
    } else {
      if (asEntryPicker) {
        setIsSelectionMode(true)
        setSelectedEntryList([entry])
        return
      }
      const app = getMatchedApp(entry)
      if (app) {
        setOpenEvent({
          transaction: EventTransaction.run_app,
          appId: app.id,
          entryList: [entry],
        })
      } else {
        handleDownloadClick([entry])
      }
    }
  }, [
    isSelectionMode,
    selectedEntryList,
    setSelectedEntryList,
    handleDirectoryOpen,
    asEntryPicker,
    setIsSelectionMode,
    setOpenEvent,
    handleDownloadClick,
  ])

  const handleContextMenu = useCallback((event: any) => {
    if (sideVisible) return

    const { target } = event
    const selectedCount = selectedEntryList.length
    const targetEntryEl = target.closest('.gagu-entry-node')

    if (targetEntryEl) {
      const targetEntryName = targetEntryEl.getAttribute('data-entry-name')
      const foundEntry = entryList.find(o => o.name === targetEntryName)

      if (selectedCount <= 1 && foundEntry) {
        setSelectedEntryList([foundEntry])
      }
    } else {
      setSelectedEntryList([])
    }

    setIsSelectionMode(true)

  }, [sideVisible, selectedEntryList, entryList, setSelectedEntryList, setIsSelectionMode])

  const handleSelectionCancel = useCallback(() => {
    setIsSelectionMode(false)
    setSelectedEntryList([])
  }, [setIsSelectionMode, setSelectedEntryList])

  const handlePopState = useCallback(() => {
    const keepPath = () => navigate(`/touch?path=${currentPath}`)
    onPopState()

    if (sideVisible) {
      keepPath()
      setSideVisible(false)
    } else if (document.querySelector('.gagu-sync-popstate-overlay')) {
      keepPath()
      ;(document.querySelector('.gagu-sync-popstate-overlay-close-button') as any)?.click()
    } else if (isSelectionMode) {
      keepPath()
      setIsSelectionMode(false)
    } else if (activeAppId !== AppId.fileExplorer) {
      keepPath()
      ;(document.querySelector('.gagu-is-top-window .gagu-hidden-switch-trigger') as any)?.click()
    } else if (sharingModalShow) {
      keepPath()
      setSharingModalShow(false)
    } else if (editMode) {
      keepPath()
      setEditMode(null)
    } else if (goToPathDialogShow) {
      keepPath()
      setGoToPathDialogShow(false)
    } else {
      const { position } = visitHistory
      if (position >= 1) {
        handleNavBack()
      } else {
        keepPath()
        Toast.error(t`tip.reachTheEndOfHistory`)
      }
    }
  }, [
    t,
    navigate,
    currentPath,
    editMode,
    setEditMode,
    activeAppId,
    handleNavBack,
    onPopState,
    sharingModalShow,
    setSharingModalShow,
    isSelectionMode,
    setIsSelectionMode,
    setSideVisible,
    sideVisible,
    visitHistory,
    goToPathDialogShow,
    setGoToPathDialogShow,
  ])

  useEffect(() => {
    setSelectedEntryList([])
    setFilterMode(false)
    setFilterText('')
    setIsSelectionMode(false)
  }, [currentPath, setSelectedEntryList, setFilterMode, setFilterText, setIsSelectionMode])

  useEffect(() => {
    setIsSelectionMode(false)
  }, [setIsSelectionMode, sideVisible])

  useEffect(() => {
    setIsSideOrSelectionMenuShow(sideVisible || isSelectionMode)
  }, [sideVisible, isSelectionMode, setIsSideOrSelectionMenuShow])

  useEffect(() => {
    onCurrentPathChange(currentPath)
  }, [onCurrentPathChange, currentPath])

  useEffect(() => {
    onPick(selectedEntryList)
  }, [onPick, selectedEntryList])

  useEffect(() => {
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [handlePopState])

  useEffect(() => {
    !asEntryPicker && navigate(`/touch?path=${currentPath}`)
  }, [asEntryPicker, currentPath, navigate])

  return (
    <>
      <Side
        {...{
          sideVisible,
          setSideVisible,
          currentPath,
          rootEntryList,
          asEntryPicker,
        }}
        onRootEntryClick={(rootEntry) => {
          setSideVisible(false)
          handleDirectoryOpen(rootEntry, true)
        }}
        onFavoriteCancel={handleFavoriteClick}
      />
    
      <div
        ref={containerRef}
        data-vibrate-disabled="true"
        className={line(`
          absolute z-0 inset-0 bg-white transition-all duration-300
          dark:bg-zinc-800
          ${visible
            ? sideVisible
              ? 'ease-in-out translate-x-64 opacity-20 overflow-y-hidden pointer-events-none'
              : 'opacity-100 overflow-y-auto'
            : 'opacity-0'
          }
          ${asEntryPicker ? 'top-0' : 'top-8'}
        `)}
        onContextMenu={handleContextMenu}
      >
        <div className="sticky z-20 top-0 bg-white select-none overflow-hidden dark:bg-zinc-800">
          <ControlBar
            appWindowWidth={360}
            disabledMap={disabledMap}
            gridMode={gridMode}
            filterMode={filterMode}
            filterText={filterText}
            hiddenVisible={hiddenVisible}
            sortType={sortType}
            setFilterMode={setFilterMode}
            setFilterText={setFilterText}
            onHiddenShowChange={handleHiddenShowChange}
            onGridModeChange={handleGridModeChange}
            onSortTypeChange={handleSortChange}
            onSideBarClick={() => setSideVisible(!sideVisible)}
            onNavBack={handleNavBack}
            onNavForward={handleNavForward}
            onNavRefresh={handleNavRefresh}
            onNavAbort={handleNavAbort}
            onNavToParent={handleNavToParent}
          />
          <StatusBar
            folderCount={folderCount}
            fileCount={fileCount}
            currentPath={currentPath}
            currentRootEntry={currentRootEntry}
            selectedEntryList={selectedEntryList}
            loading={querying}
            onDirClick={handleGoFullPath}
            onRootEntryClick={(entry) => handleDirectoryOpen(entry, true)}
          />
        </div>
        <div
          data-vibrate-disabled="true"
          className="relative z-0 select-none"
          style={{
            height: virtualizer.getTotalSize() + virtualBox.marginY + virtualContainer.padding * 2 + BOTTOM_MENU_PADDING
          }}
        >
          {virtualizer.getVirtualItems().map(({ key: rowKey, index: rowIndex }) => {
            const { cols } = virtualContainer
            const startIndex = rowIndex * cols
            const endIndex = startIndex + cols
            const rowEntries = boundedEntryList.slice(startIndex, endIndex)

            return (
              <Fragment key={rowKey}>
                {rowEntries.map((entry) => {
                  const isSelected = selectedEntryList.some(o => getIsSameEntry(o, entry))
                  const isFavorited = favoriteRootEntryList.some(o => getIsSameEntry(o, entry))

                  return (
                    <EntryNodeTouch
                      key={encodeURIComponent(`${entry.name}-${entry.type}`)}
                      entry={entry}
                      kiloSize={kiloSize}
                      gridMode={gridMode}
                      style={getBoundStyle(entry.bound)}
                      isSelectionMode={isSelectionMode}
                      isSelected={isSelected}
                      isFavorited={isFavorited}
                      supportThumbnail={supportThumbnail}
                      requestState={{ deleting, sizeQuerying }}
                      onClick={handleEntryClick}
                    />
                  )
                })}
              </Fragment>
            )
          })}
        </div>

        <EmptyPanel visible={!querying && isEntryListEmpty} />

      </div>

      <SelectionMenu
        visible={isSelectionMode}
        asEntryPicker={asEntryPicker}
        favoriteRootEntryList={favoriteRootEntryList}
        selectedEntryList={selectedEntryList}
        setMovementEntryPickerShow={setMovementEntryPickerShow}
        setGoToPathDialogShow={setGoToPathDialogShow}
        clipboardData={clipboardData}
        onClipboardAdd={handleClipboardAdd}
        onClipboardPaste={handleClipboardPaste}
        onEdit={(mode, entry) => {
          setEditMode(mode)
          setActiveEntry(entry || null)
        }}
        onDirectorySizeUpdate={handleDirectorySizeUpdate}
        onFavoriteClick={handleFavoriteClick}
        onUploadClick={handleUploadClick}
        onDownloadClick={handleDownloadClick}
        onShareClick={handleShareClick}
        onDeleteClick={handleDeleteClick}
        onSelectAll={handleSelectAll}
        onCancel={handleSelectionCancel}
      />

      <SharingModal
        visible={sharingModalShow}
        entryList={sharingEntryList}
        onClose={() => setSharingModalShow(false)}
      />

      <GoToPathDialog
        visible={goToPathDialogShow}
        currentPath={currentPath}
        onGo={(path) => {
          handleGoFullPath(path, true)
          setGoToPathDialogShow(false)
        }}
        onCancel={() => setGoToPathDialogShow(false)}
      />

      <EntryPicker
        visible={movementEntryPickerShow}
        appId={AppId.fileExplorer}
        mode="open"
        type={EntryType.directory}
        title={t`action.moveTo`}
        onConfirm={({ pickedPath }) => {
          handleMove(selectedEntryList, pickedPath)
          handleSelectionCancel()
          setMovementEntryPickerShow(false)
        }}
        onCancel={() => {
          handleSelectionCancel()
          setMovementEntryPickerShow(false)
        }}
      />

      <EntryNameDialog
        editMode={editMode}
        setEditMode={setEditMode}
        currentPath={currentPath}
        activeEntry={activeEntry}
        onSuccess={() => {
          setEditMode(null)
          handleNavRefresh()
        }}
      />
    </>
  )
}
