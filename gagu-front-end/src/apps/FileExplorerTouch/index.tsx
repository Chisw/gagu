
import { useCallback, useEffect, useRef } from 'react'
import { EmptyPanel } from '../../components/common'
import { getMatchedApp, isSameEntry, line } from '../../utils'
import ControlBar from '../FileExplorer/ControlBar'
import StatusBar from '../FileExplorer/StatusBar'
import EntryNode from './EntryNode'
import SelectionMenu from './SelectionMenu'
import Side from './Side'
import { useFileExplorer } from '../../hooks'
import { SharingModal } from '../../components'
import { openOperationState } from '../../states'
import { useRecoilState } from 'recoil'
import { IEntry } from '../../types'

interface FileExplorerTouchProps {
  show: boolean
  sideShow: boolean
  setSideShow: (show: boolean) => void
  isSelectionMode: boolean
  setIsSelectionMode: (show: boolean) => void
  asSelector?: boolean
  onSelect?: (entryList: IEntry[]) => void
}

export default function FileExplorerTouch(props: FileExplorerTouchProps) {

  const {
    show,
    sideShow,
    setSideShow,
    isSelectionMode,
    setIsSelectionMode,
    asSelector = false,
    onSelect = () => {},
  } = props

  const [, setOpenOperation] = useRecoilState(openOperationState)

  const containerRef = useRef(null)

  const {
    entryPathMap, disabledMap, supportThumbnail, thumbScrollWatcher,
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
  } = useFileExplorer({ containerRef })

  const handleEntryClick = useCallback((entry: IEntry) => {
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
      if (asSelector) {
        setIsSelectionMode(true)
        setSelectedEntryList([entry])
        return
      }
      const app = getMatchedApp(entry)
      if (app) {
        setOpenOperation({ appId: app.id, entryList: [entry] })
      } else {
        handleDownloadClick([entry])
      }
    }
  }, [isSelectionMode, selectedEntryList, setSelectedEntryList, handleDirectoryOpen, asSelector, setIsSelectionMode, setOpenOperation, handleDownloadClick])

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

  }, [sideShow, selectedEntryList, entryList, setSelectedEntryList, setIsSelectionMode])

  useEffect(() => {
    const title = isInRoot
      ? (activeRootEntry?.name || currentPath)
      : currentPath.split('/').pop() as string
    document.title = title
  }, [currentPath, isInRoot, activeRootEntry])

  useEffect(() => {
    setSelectedEntryList([])
    setFilterMode(false)
    setFilterText('')
    setIsSelectionMode(false)
  }, [currentPath, setSelectedEntryList, setFilterMode, setFilterText, setIsSelectionMode])

  useEffect(() => {
    onSelect(selectedEntryList)
  }, [onSelect, selectedEntryList])

  useEffect(() => {
    setIsSelectionMode(false)
  }, [setIsSelectionMode, sideShow])

  return (
    <>
      <Side
        {...{
          sideShow,
          setSideShow,
          currentPath,
          rootEntryList,
          favoriteEntryList,
          asSelector,
        }}
        onRootEntryClick={(rootEntry) => {
          setSideShow(false)
          handleRootEntryClick(rootEntry)
        }}
        onFavoriteClick={handleFavoriteClick}
      />
    
      <div
        ref={containerRef}
        data-vibrate-disabled="true"
        className={line(`
          absolute z-0 inset-0 bg-white transition-all duration-500
          ${show ? 'opacity-100' : 'opacity-0'}
          ${sideShow ? 'ease-in-out translate-x-64 opacity-20 overflow-y-hidden pointer-events-none' : 'overflow-y-auto'}
          ${asSelector ? 'top-0' : 'top-8 md:top-6'}
        `)}
        onContextMenu={handleContextMenu}
      >
        <div className="sticky z-20 top-0 bg-white select-none overflow-hidden">
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
        <div
          data-vibrate-disabled="true"
          className="flex flex-wrap px-1 py-2 pb-36 select-none"
        >
          {entryList.map(entry => {
            const isSelected = selectedEntryList.some(o => isSameEntry(o, entry))
            const isFavorited = favoriteEntryList.some(o => isSameEntry(o, entry))
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

      <SelectionMenu
        show={isSelectionMode}
        {...{
          asSelector,
          favoriteEntryList,
          selectedEntryList,
        }}
        onDirectorySizeUpdate={handleDirectorySizeUpdate}
        onFavoriteClick={handleFavoriteClick}
        onUploadClick={handleUploadClick}
        onDownloadClick={handleDownloadClick}
        onShareClick={handleShareClick}
        onDeleteClick={handleDeleteClick}
        onSelectAll={handleSelectAll}
        onCancel={() => {
          setIsSelectionMode(false)
          setSelectedEntryList([])
        }}
      />

      <SharingModal
        visible={sharingModalShow}
        entryList={sharedEntryList}
        onClose={() => setSharingModalShow(false)}
      />
    </>
  )
}
