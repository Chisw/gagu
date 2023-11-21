import { EmptyPanel } from '../../components/common'
import { useRecoilState } from 'recoil'
import { activePageState } from '../../states'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import EntrySelector from '../../components/EntrySelector'
import MenuBar from '../../components/MenuBar'
import { IEntry, Page } from '../../types'
import { getMatchedApp, isSameEntry, vibrate } from '../../utils'
import EntryNode from './EntryNode'
import StatusBar from '../../apps/FileExplorer/StatusBar'
import ControlBar, { IControlBarDisabledMap } from '../../apps/FileExplorer/ControlBar'
import SharingModal from '../../components/SharingModal'
import SelectionMenu from './SelectionMenu'
import FixedMenu from './FixedMenu'
import Side from './Side'
import useFileExplorer from '../../hooks/useFileExplorer'

export default function TouchPage() {

  const [activePage, setActivePage] = useRecoilState(activePageState)
  // const [, setOpenOperation] = useRecoilState(openOperationState)

  const [filterText, setFilterText] = useState('')
  const [hiddenShow, setHiddenShow] = useState(false)
  const [filterMode, setFilterMode] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [sideShow, setSideShow] = useState(false)

  const containerRef = useRef(null)
  const uploadInputRef = useRef(null)

  const {
    rootInfo, entryPathMap, currentPath, activeRootEntry,
    querying, sizeQuerying, deleting,
    rootEntryList, favoriteEntryList, isInRoot,
    entryList, selectedEntryList, isEntryListEmpty, folderCount, fileCount, gridMode, sortType,
    visitHistory, setSelectedEntryList,
    handleRootEntryClick, handleDirectoryOpen, handleGoFullPath,
    handleNavBack, handleNavForward, handleNavRefresh, handleNavAbort, handleNavToParent,
    sharingModalShow, setSharingModalShow, sharedEntryList,
    handleSelectAll, handleDownloadClick, handleShareClick, handleDirectorySizeUpdate, handleFavorite, handleDeleteClick,
    scrollHook,
    handleGridModeChange, handleSortChange,
    addUploadTransferTask,
  } = useFileExplorer({
    filterText,
    hiddenShow,
    containerRef,
  })

  useEffect(() => {
    setSelectedEntryList([])
    setFilterMode(false)
    setFilterText('')
    setIsSelectionMode(false)
  }, [currentPath, setSelectedEntryList])

  useEffect(() => {
    const title = isInRoot
      ? (activeRootEntry?.name || currentPath)
      : currentPath.split('/').pop() as string
    document.title = title
  }, [currentPath, isInRoot, activeRootEntry])

  useEffect(() => {
    setTimeout(() => setActivePage(Page.touch))
  }, [setActivePage])

  const handleUploadClick = useCallback(() => {
    (uploadInputRef.current as any)?.click()
  }, [])

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

    const { type } = entry
    if (type === 'directory') {
      handleDirectoryOpen(entry)
    } else {
      const app = getMatchedApp(entry)
      if (app) {
        // const matchedEntryList = entryList.filter(en => app.matchList?.includes(en.extension))
        // const activeEntryIndex = matchedEntryList.findIndex(en => en.name === name)
        // setOpenOperation({
        //   app,
        //   matchedEntryList,
        //   activeEntryIndex,
        // })
      } else {
        handleDownloadClick([entry])
      }
    }
  }, [isSelectionMode, selectedEntryList, setSelectedEntryList, handleDirectoryOpen, handleDownloadClick])

  const disabledMap = useMemo(() => {
    const { position, list } = visitHistory
    const disabledMap: IControlBarDisabledMap = {
      navBack: position <= 0,
      navForward: list.length === position + 1,
      refresh: querying || !currentPath,
      navToParent: !currentPath || isInRoot,
      newDir: false,
      newTxt: false,
      rename: selectedEntryList.length !== 1,
      upload: false,
      download: isEntryListEmpty,
      delete: !selectedEntryList.length,
      selectAll: isEntryListEmpty,
    }
    return disabledMap
  }, [visitHistory, querying, currentPath, isInRoot, selectedEntryList, isEntryListEmpty])

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
        <MenuBar />
        <Side
          sideShow={sideShow}
          setSideShow={setSideShow}
          currentPath={currentPath}
          rootEntryList={rootEntryList}
          favoriteEntryList={favoriteEntryList}
          handleRootEntryClick={(rootEntry) => {
            vibrate()
            setSideShow(false)
            handleRootEntryClick(rootEntry)
          }}
          handleFavorite={handleFavorite}
        />
        <div
          ref={containerRef}
          className={`
            absolute z-10 inset-0 top-6 bg-white transition-all duration-500
            ${activePage === Page.touch ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[10%]'}
            ${sideShow ? 'ease-in-out translate-x-56 opacity-20 overflow-y-hidden' : 'overflow-y-auto'}
          `}
          onContextMenu={handleContextMenu}
        >
          {sideShow && (
            <div
              className="absolute inset-0 z-50"
              onClick={() => {
                vibrate()
                setSideShow(false)
              }}
            />
          )}
          <div className="sticky z-20 top-0 bg-white select-none">
            <ControlBar
              {...{ windowWidth: 360, disabledMap, gridMode, filterMode, filterText, hiddenShow, sortType }}
              {...{ setFilterMode, setFilterText, setHiddenShow }}
              onGridModeChange={handleGridModeChange}
              onSortTypeChange={handleSortChange}
              onNavBack={handleNavBack}
              onNavForward={handleNavForward}
              onNavRefresh={handleNavRefresh}
              onNavAbort={handleNavAbort}
              onNavToParent={handleNavToParent}
              onNewDir={() => {}}
              onNewTxt={() => {}}
              onRename={() => {}}
              onUpload={() => {}}
              onDownload={() => {}}
              onDelete={() => {}}
              onSelectAll={() => {}}
            />
            <StatusBar
              {...{ folderCount, fileCount, currentPath, rootEntry: activeRootEntry, selectedEntryList }}
              loading={querying}
              onDirClick={handleGoFullPath}
              onRootEntryClick={handleRootEntryClick}
            />
          </div>
          <div
            className="flex flex-wrap px-1 py-2 pb-36 select-none"
          >
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
                    scrollHook,
                  }}
                  requestState={{ deleting, sizeQuerying }}
                  onClick={(e, entry) => handleEntryClick(entry)}
                />
              )
            })}
          </div>

          <EmptyPanel show={!querying && isEntryListEmpty} />

        </div>
      </div>

      <input
        multiple
        ref={uploadInputRef}
        type="file"
        className="hidden"
        onChange={(e: any) => addUploadTransferTask([...e.target.files])}
      />

      <SharingModal
        visible={sharingModalShow}
        entryList={sharedEntryList}
        onClose={() => setSharingModalShow(false)}
      />

      <SelectionMenu
        show={isSelectionMode}
        favoriteEntryList={favoriteEntryList}
        selectedEntryList={selectedEntryList}
        handleDirectorySizeUpdate={handleDirectorySizeUpdate}
        handleFavorite={handleFavorite}
        handleDownloadClick={handleDownloadClick}
        handleShareClick={handleShareClick}
        handleDeleteClick={handleDeleteClick}
        handleSelectAll={handleSelectAll}
        onCancel={() => {
          setIsSelectionMode(false)
          setSelectedEntryList([])
        }}
      />

      <FixedMenu
        sideShow={sideShow}
        setSideShow={setSideShow}
        isSelectionMode={isSelectionMode}
        disabledMap={disabledMap}
        handleUploadClick={handleUploadClick}
      />
    </>
  )
}
