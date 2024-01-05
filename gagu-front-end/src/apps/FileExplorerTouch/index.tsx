
import { useCallback, useEffect, useRef, useState } from 'react'
import { EmptyPanel } from '../../components/common'
import { getMatchedApp, getIsSameEntry, line } from '../../utils'
import ControlBar from '../FileExplorer/ControlBar'
import StatusBar from '../FileExplorer/StatusBar'
import EntryNode from './EntryNode'
import SelectionMenu from './SelectionMenu'
import Side from './Side'
import { useFileExplorer } from '../../hooks'
import { EntryPicker, SharingModal } from '../../components'
import { openEventState } from '../../states'
import { useRecoilState } from 'recoil'
import { AppId, EntryType, EventTransaction, ExplorerPickProps, IEntry } from '../../types'
import EntryNameDialog from './EntryNameDialog'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

interface FileExplorerTouchProps extends ExplorerPickProps {
  show: boolean
  sideShow: boolean
  setSideShow: (show: boolean) => void
  isSelectionMode: boolean
  setIsSelectionMode: (show: boolean) => void
  activeAppId?: string
  setDockExpanded?: (expanded: boolean) => void
}

export default function FileExplorerTouch(props: FileExplorerTouchProps) {

  const {
    show,
    sideShow,
    setSideShow,
    isSelectionMode,
    setIsSelectionMode,
    asEntryPicker = false,
    onCurrentPathChange = () => {},
    onPick = () => {},
    activeAppId = '',
    setDockExpanded = () => {},
  } = props

  const navigate = useNavigate()
  const { t } = useTranslation()

  const [, setOpenEvent] = useRecoilState(openEventState)

  const [activeEntry, setActiveEntry] = useState<IEntry | null>(null)

  const containerRef = useRef(null)

  const {
    kiloSize,
    disabledMap, supportThumbnail, thumbScrollWatcher,
    currentPath, currentRootEntry,
    querying, sizeQuerying, deleting,
    entryList, rootEntryList, favoriteRootEntryList, sharingEntryList,
    isEntryListEmpty, visitHistory,
    folderCount, fileCount,
    editMode, setEditMode,
    filterMode, setFilterMode,
    filterText, setFilterText,
    hiddenShow, handleHiddenShowChange,
    gridMode, handleGridModeChange,
    sortType, handleSortChange,
    selectedEntryList, setSelectedEntryList,
    sharingModalShow, setSharingModalShow,
    activeEntryPickerProps, setActiveEntryPickerProps,
    handleSelectAll, handleDirectorySizeUpdate,
    handleDirectoryOpen, handleGoFullPath,
    handleNavBack, handleNavForward, handleNavRefresh, handleNavAbort, handleNavToParent,
    handleUploadClick, handleDownloadClick,
    handleShareClick, handleFavoriteClick, handleDeleteClick,
  } = useFileExplorer({ containerRef })

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


  const handleStatePop = useCallback(() => {
    const keepPath = () => navigate(`/touch?path=${currentPath}`)
    setDockExpanded(false)

    if (sideShow) {
      keepPath()
      setSideShow(false)
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
    } else {
      const { position } = visitHistory
      if (position >= 1) {
        handleNavBack()
      } else {
        keepPath()
        toast.error(t`tip.reachTheEndOfHistory`, { icon: '⚠️' })
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
    setDockExpanded,
    sharingModalShow,
    setSharingModalShow,
    isSelectionMode,
    setIsSelectionMode,
    setSideShow,
    sideShow,
    visitHistory,
  ])

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
    onPick(selectedEntryList)
  }, [onPick, selectedEntryList])

  useEffect(() => {
    window.addEventListener('popstate', handleStatePop)
    return () => window.removeEventListener('popstate', handleStatePop)
  }, [handleStatePop])

  useEffect(() => {
    !asEntryPicker && navigate(`/touch?path=${currentPath}`)
  }, [asEntryPicker, currentPath, navigate])

  return (
    <>
      <Side
        {...{
          sideShow,
          setSideShow,
          currentPath,
          rootEntryList,
          asEntryPicker,
        }}
        onRootEntryClick={(rootEntry) => {
          setSideShow(false)
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
          ${show ? 'opacity-100' : 'opacity-0'}
          ${sideShow ? 'ease-in-out translate-x-64 opacity-20 overflow-y-hidden pointer-events-none' : 'overflow-y-auto'}
          ${asEntryPicker ? 'top-0' : 'top-8 md:top-6'}
        `)}
        onContextMenu={handleContextMenu}
      >
        <div className="sticky z-20 top-0 bg-white select-none overflow-hidden dark:bg-zinc-800">
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
              currentRootEntry,
              selectedEntryList,
            }}
            loading={querying}
            onDirClick={handleGoFullPath}
            onRootEntryClick={(entry) => handleDirectoryOpen(entry, true)}
          />
        </div>
        <div
          data-vibrate-disabled="true"
          className="flex flex-wrap px-1 py-2 pb-36 select-none"
        >
          {entryList.map(entry => {
            const isSelected = selectedEntryList.some(o => getIsSameEntry(o, entry))
            const isFavorited = favoriteRootEntryList.some(o => getIsSameEntry(o, entry))
            return (
              <EntryNode
                key={encodeURIComponent(`${entry.name}-${entry.type}`)}
                {...{
                  entry,
                  kiloSize,
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
          asEntryPicker,
          favoriteRootEntryList,
          selectedEntryList,
          setActiveEntryPickerProps,
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
        show={sharingModalShow}
        entryList={sharingEntryList}
        onClose={() => setSharingModalShow(false)}
      />

      {activeEntryPickerProps && <EntryPicker forceShow {...activeEntryPickerProps} />}

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
