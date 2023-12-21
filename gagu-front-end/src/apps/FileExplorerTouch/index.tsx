
import { useCallback, useEffect, useRef, useState } from 'react'
import { EmptyPanel } from '../../components/common'
import { getMatchedApp, getIsSameEntry, line } from '../../utils'
import ControlBar from '../FileExplorer/ControlBar'
import StatusBar from '../FileExplorer/StatusBar'
import EntryNode from './EntryNode'
import SelectionMenu from './SelectionMenu'
import Side from './Side'
import { useFileExplorer } from '../../hooks'
import { SharingModal } from '../../components'
import { entrySelectorEventState, openEventState } from '../../states'
import { useRecoilState } from 'recoil'
import { AppId, EventTransaction, ExplorerSelectorProps, IEntry } from '../../types'
import EntryNameDialog from './EntryNameDialog'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

interface FileExplorerTouchProps extends ExplorerSelectorProps {
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
    asSelector = false,
    onCurrentPathChange = () => {},
    onSelect = () => {},
    activeAppId = '',
    setDockExpanded = () => {},
  } = props

  const navigate = useNavigate()
  const { t } = useTranslation()

  const [, setOpenEvent] = useRecoilState(openEventState)
  const [entrySelectorEvent, setEntrySelectorEvent] = useRecoilState(entrySelectorEventState)

  const [activeEntry, setActiveEntry] = useState<IEntry | null>(null)

  const containerRef = useRef(null)

  const {
    disabledMap, supportThumbnail, thumbScrollWatcher,
    currentPath, activeRootEntry,
    querying, sizeQuerying, deleting,
    entryList, favoriteEntryList, sideEntryList, sharingEntryList,
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


  const handleStatePop = useCallback(() => {
    const keepPath = () => navigate(`/touch?path=${currentPath}`)
    setDockExpanded(false)

    if (sideShow) {
      keepPath()
      setSideShow(false)
    } else if (isSelectionMode) {
      keepPath()
      setIsSelectionMode(false)
    } else if (entrySelectorEvent) {
      keepPath()
      setEntrySelectorEvent(null)
    } else if (activeAppId !== AppId.fileExplorer) {
      keepPath()
      ;(document.querySelector('.gagu-is-top-window .gagu-hidden-switch-trigger') as any)?.click()
    } else if (sharingModalShow) {
      keepPath()
      setSharingModalShow(false)
    } else if (editMode) {
      keepPath()
      setEditMode(null)
    } else if (document.querySelector('.gagu-sync-popstate-overlay')) {
      keepPath()
      ;(document.querySelector('.gagu-sync-popstate-overlay-close-button') as any)?.click()
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
    entrySelectorEvent,
    handleNavBack,
    setDockExpanded,
    sharingModalShow,
    setSharingModalShow,
    isSelectionMode,
    setEntrySelectorEvent,
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
    onSelect(selectedEntryList)
  }, [onSelect, selectedEntryList])

  useEffect(() => {
    window.addEventListener('popstate', handleStatePop)
    return () => window.removeEventListener('popstate', handleStatePop)
  }, [handleStatePop])

  useEffect(() => {
    !asSelector && navigate(`/touch?path=${currentPath}`)
  }, [asSelector, currentPath, navigate])

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
          handleDirectoryOpen(sideEntry, true)
        }}
        onFavoriteCancel={(entry) => handleFavoriteClick(entry, true)}
      />
    
      <div
        ref={containerRef}
        data-vibrate-disabled="true"
        className={line(`
          absolute z-0 inset-0 bg-white transition-all duration-300
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
            const isSelected = selectedEntryList.some(o => getIsSameEntry(o, entry))
            const isFavorited = favoriteEntryList.some(o => getIsSameEntry(o, entry))
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
        show={sharingModalShow}
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
