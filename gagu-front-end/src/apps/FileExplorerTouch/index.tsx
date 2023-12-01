
import { useCallback, useEffect, useRef, useState } from 'react'
import { EmptyPanel } from '../../components/common'
import { getMatchedApp, isSameEntry, line } from '../../utils'
import ControlBar from '../FileExplorer/ControlBar'
import StatusBar from '../FileExplorer/StatusBar'
import EntryNode from './EntryNode'
import SelectionMenu from './SelectionMenu'
import Side from './Side'
import { useFileExplorer } from '../../hooks'
import { SharingModal } from '../../components'
import { openEventState } from '../../states'
import { useRecoilState } from 'recoil'
import { EventTransaction, ExplorerSelectorProps, IEntry } from '../../types'
import EntryNameDialog from './EntryNameDialog'
// import { useNavigate } from 'react-router'

interface FileExplorerTouchProps extends ExplorerSelectorProps {
  show: boolean
  sideShow: boolean
  setSideShow: (show: boolean) => void
  isSelectionMode: boolean
  setIsSelectionMode: (show: boolean) => void
}

export default function FileExplorerTouch(props: FileExplorerTouchProps) {

  const {
    show,
    sideShow,
    setSideShow,
    isSelectionMode,
    setIsSelectionMode,
    asSelector = false,
    onCurrentPathChange = () => {},
    onSelect = () => {},
  } = props

  // const navigate = useNavigate()

  const [, setOpenEvent] = useRecoilState(openEventState)
  const [activeEntry, setActiveEntry] = useState<IEntry | null>(null)

  const containerRef = useRef(null)

  const {
    disabledMap, supportThumbnail, thumbScrollWatcher,
    currentPath, activeRootEntry,
    querying, sizeQuerying, deleting,
    entryList, favoriteEntryList, sideEntryList, sharingEntryList,
    isEntryListEmpty,
    folderCount, fileCount,
    editMode, setEditMode,
    filterMode, setFilterMode,
    filterText, setFilterText,
    hiddenShow, handleHiddenShowChange,
    gridMode, handleGridModeChange,
    sortType, handleSortChange,
    selectedEntryList, setSelectedEntryList,
    sharingModalShow, setSharingModalShow,
    handleSelectAll, handleDirectorySizeUpdate,
    handleDirectoryOpen, handleGoFullPath,
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
      // navigate(`/touch?path=${getEntryPath(entry)}`)
    } else {
      if (asSelector) {
        setIsSelectionMode(true)
        setSelectedEntryList([entry])
        return
      }
      const app = getMatchedApp(entry)
      if (app) {
        setOpenEvent({
          transaction: EventTransaction.app_run,
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
    // navigate,
    asSelector,
    setIsSelectionMode,
    setOpenEvent,
    handleDownloadClick,
  ])

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

  // useEffect(() => {
  //   window.addEventListener('popstate', handleNavBack)
  //   return () => window.removeEventListener('popstate', handleNavBack)
  // }, [handleNavBack])

  useEffect(() => {
    setSelectedEntryList([])
    setFilterMode(false)
    setFilterText('')
    setIsSelectionMode(false)
  }, [currentPath, setSelectedEntryList, setFilterMode, setFilterText, setIsSelectionMode])

  useEffect(() => {
    setIsSelectionMode(false)
  }, [setIsSelectionMode, sideShow])

  useEffect(() => {
    onCurrentPathChange(currentPath)
  }, [onCurrentPathChange, currentPath])

  useEffect(() => {
    onSelect(selectedEntryList)
  }, [onSelect, selectedEntryList])

  return (
    <>
      <Side
        {...{
          sideShow,
          setSideShow,
          currentPath,
          sideEntryList,
          asSelector,
        }}
        onSideEntryClick={(sideEntry) => {
          setSideShow(false)
          // navigate(`/touch?path=${getEntryPath(sideEntry)}`)
          handleDirectoryOpen(sideEntry, true)
        }}
        onFavoriteCancel={(entry) => handleFavoriteClick(entry, true)}
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
              selectedEntryList,
            }}
            loading={querying}
            rootEntry={activeRootEntry}
            onDirClick={handleGoFullPath}
            onRootEntryClick={(entry) => handleDirectoryOpen(entry, true)}
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
        onCancel={() => {
          setIsSelectionMode(false)
          setSelectedEntryList([])
        }}
      />

      <SharingModal
        visible={sharingModalShow}
        entryList={sharingEntryList}
        onClose={() => setSharingModalShow(false)}
      />

      <EntryNameDialog
        {...{
          editMode,
          setEditMode,
          currentPath,
          activeEntry,
        }}
        onSuccess={() => {
          setEditMode(null)
          handleNavRefresh()
        }}
      />
    </>
  )
}
