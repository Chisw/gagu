import { EmptyPanel } from '../../components/common'
import { useRecoilState } from 'recoil'
import { useFileExplorer } from '../../hooks'
import { activePageState, openOperationState, runningAppListState } from '../../states'
import { useCallback, useEffect, useRef, useState } from 'react'
import EntrySelector from '../../components/EntrySelector'
import MenuBar from '../../components/MenuBar'
import { IEntry, Page } from '../../types'
import { getMatchedApp, isSameEntry, line, vibrate } from '../../utils'
import EntryNode from './EntryNode'
import StatusBar from '../../apps/FileExplorer/StatusBar'
import ControlBar from '../../apps/FileExplorer/ControlBar'
import SharingModal from '../../components/SharingModal'
import SelectionMenu from './SelectionMenu'
import Dock from './Dock'
import Side from './Side'
import { APP_ID_MAP } from '../../apps'
import Window from './Window'

export default function TouchPage() {

  const [activePage, setActivePage] = useRecoilState(activePageState)
  const [runningAppList] = useRecoilState(runningAppListState)
  const [, setOpenOperation] = useRecoilState(openOperationState)

  const [show, setShow] = useState(false)
  const [sideShow, setSideShow] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [activeAppId, setActiveAppId] = useState(APP_ID_MAP.fileExplorer)

  const containerRef = useRef(null)

  const {
    rootInfo, entryPathMap, disabledMap, thumbScrollWatcher,
    currentPath, activeRootEntry,
    querying, sizeQuerying, deleting,
    entryList, rootEntryList, favoriteEntryList, sharedEntryList,
    isInRoot, isEntryListEmpty,
    folderCount, fileCount,
    // editMode, setEditMode,
    filterMode, setFilterMode,
    filterText, setFilterText,
    hiddenShow, handleHiddenShowChange,
    gridMode, handleGridModeChange,
    sortType, handleSortChange,
    selectedEntryList, setSelectedEntryList,
    sharingModalShow, setSharingModalShow,
    handleSelectAll, handleDirectorySizeUpdate,
    handleRootEntryClick, handleDirectoryOpen, handleGoFullPath,
    handleNavBack, handleNavForward, handleNavRefresh, handleNavAbort, handleNavToParent,
    handleUploadClick, handleDownloadClick,
    handleShareClick, handleFavoriteClick, handleDeleteClick,
  } = useFileExplorer({
    touchMode: true,
    containerRef,
  })

  useEffect(() => {
    setTimeout(() => setActivePage(Page.touch))
  }, [setActivePage])

  useEffect(() => {
    if (activePage === Page.touch) {
      setTimeout(() => setShow(true), 400)
    } else {
      setShow(false)
    }
  }, [activePage])

  useEffect(() => {
    setSelectedEntryList([])
    setFilterMode(false)
    setFilterText('')
    setIsSelectionMode(false)
  }, [currentPath, setSelectedEntryList, setFilterMode, setFilterText])

  useEffect(() => {
    const title = isInRoot
      ? (activeRootEntry?.name || currentPath)
      : currentPath.split('/').pop() as string
    document.title = title
  }, [currentPath, isInRoot, activeRootEntry])

  const handleEntryClick = useCallback((entry: IEntry) => {
    vibrate()

    if (isSelectionMode) {
      let list = [...selectedEntryList]
      if (list.find(e => isSameEntry(e, entry))) {
        list = list.filter(e => !isSameEntry(e, entry))
      } else {
        list.push(entry)
      }
      setSelectedEntryList(list)
      return
    }

    const { name, type } = entry
    if (type === 'directory') {
      handleDirectoryOpen(entry)
    } else {
      const app = getMatchedApp(entry)
      if (app) {
        const matchedEntryList = entryList.filter(entry => app.matchList?.includes(entry.extension))
        const activeEntryIndex = matchedEntryList.findIndex(entry => entry.name === name)
        setOpenOperation({
          app,
          matchedEntryList,
          activeEntryIndex,
        })
      } else {
        handleDownloadClick([entry])
      }
    }
  }, [isSelectionMode, selectedEntryList, setSelectedEntryList, handleDirectoryOpen, entryList, setOpenOperation, handleDownloadClick])

  const handleContextMenu = useCallback((event: any) => {
      if (sideShow) return

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

    }, [sideShow, selectedEntryList.length, entryList, setSelectedEntryList])

  return (
    <>
      <div
        className="fixed z-0 inset-0 overflow-hidden"
        data-touch-mode="true"
        onContextMenuCapture={e => e.preventDefault()}
      >
        <EntrySelector />

        {/* z-30 */}
        {runningAppList.map(app => (
          <Window
            key={app.runningId}
            app={app}
            isTopWindow={app.id === activeAppId}
            onClose={() => setActiveAppId(APP_ID_MAP.fileExplorer)}
          />
        ))}

        {/* z-20 */}
        <MenuBar />

        {/* z-0 */}
        <Side
          {...{
            sideShow,
            setSideShow,
            currentPath,
            rootEntryList,
            favoriteEntryList,
          }}
          onRootEntryClick={(rootEntry) => {
            vibrate()
            setSideShow(false)
            handleRootEntryClick(rootEntry)
          }}
          onFavoriteClick={(rootEntry, isFavorited) => {
            vibrate()
            handleFavoriteClick(rootEntry, isFavorited)
          }}
        />

        {/* z-0 */}
        <div
          ref={containerRef}
          className={line(`
            absolute z-0 inset-0 top-6 bg-white transition-all duration-500
            ${show ? 'opacity-100' : 'opacity-0'}
            ${sideShow ? 'ease-in-out translate-x-56 opacity-20 overflow-y-hidden pointer-events-none' : 'overflow-y-auto'}
          `)}
          onContextMenu={handleContextMenu}
        >
          <div className="sticky z-20 top-0 bg-white select-none">
            <ControlBar
              {...{
                windowWidth: 360,
                disabledMap,
                gridMode,
                filterMode,
                filterText,
                hiddenShow,
                sortType,
                setFilterMode,
                setFilterText,
              }}
              onHiddenShowChange={handleHiddenShowChange}
              onGridModeChange={handleGridModeChange}
              onSortTypeChange={handleSortChange}
              onSideBarClick={() => setSideShow(!sideShow)}
              onNavBack={handleNavBack}
              onNavForward={handleNavForward}
              onNavRefresh={handleNavRefresh}
              onNavAbort={handleNavAbort}
              onNavToParent={handleNavToParent}
              onEdit={() => {}}
              onUpload={() => {}}
              onDownload={() => {}}
              onDelete={() => {}}
              onSelectAll={() => {}}
            />
            <StatusBar
              {...{
                folderCount,
                fileCount,
                currentPath,
                rootEntry:
                activeRootEntry,
                selectedEntryList,
              }}
              loading={querying}
              onDirClick={handleGoFullPath}
              onRootEntryClick={handleRootEntryClick}
            />
          </div>
          <div className="flex flex-wrap px-1 py-2 pb-36 select-none">
            {entryList.map(entry => {
              const isSelected = selectedEntryList.some(o => isSameEntry(o, entry))
              const isFavorited = favoriteEntryList.some(o => isSameEntry(o, entry))
              const supportThumbnail = rootInfo.serverOS.supportThumbnail
              return (
                <EntryNode
                  key={encodeURIComponent(`${entry.name}-${entry.type}`)}
                  {...{
                    entry,
                    gridMode,
                    isSelectionMode,
                    isSelected,
                    isFavorited,
                    supportThumbnail,
                    entryPathMap,
                    thumbScrollWatcher,
                  }}
                  requestState={{ deleting, sizeQuerying }}
                  onClick={handleEntryClick}
                />
              )
            })}
          </div>

          <EmptyPanel show={!querying && isEntryListEmpty} />

        </div>

      </div>

      <Dock
        show={!(sideShow || isSelectionMode || activeAppId !== APP_ID_MAP.fileExplorer)}
        activeAppId={activeAppId}
        setActiveAppId={setActiveAppId}
        onUploadClick={handleUploadClick}
      />

      <SharingModal
        visible={sharingModalShow}
        entryList={sharedEntryList}
        onClose={() => setSharingModalShow(false)}
      />

      <SelectionMenu
        show={isSelectionMode}
        {...{
          favoriteEntryList,
          selectedEntryList,
        }}
        onDirectorySizeUpdate={handleDirectorySizeUpdate}
        onFavoriteClick={handleFavoriteClick}
        onDownloadClick={handleDownloadClick}
        onShareClick={handleShareClick}
        onDeleteClick={handleDeleteClick}
        onSelectAll={handleSelectAll}
        onCancel={() => {
          setIsSelectionMode(false)
          setSelectedEntryList([])
        }}
      />

    </>
  )
}
