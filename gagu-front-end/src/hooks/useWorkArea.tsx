import { useRecoilState } from 'recoil'
import { contextMenuDataState, openEventState } from '../states'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDragTransfer, useFileExplorer, useHotKey, useLassoSelect } from '.'
import { ClipboardType, EditMode, EditModeType, EntryType, EventTransaction, IContextMenuItem, IEntry, ILassoInfo, NameFailType } from '../types'
import { BG_EXTENSION_LIST, getEntryPath, getIsCovered, getMatchedApp, getIsSameEntry, openInIINA } from '../utils'
import { pick, throttle } from 'lodash-es'
import { SvgIcon } from '../components/common'
import { useTranslation } from 'react-i18next'
import { CALLABLE_APP_LIST } from '../apps'
import toast from 'react-hot-toast'

interface useWorkAreaProps {
  isUserDesktop: boolean
  isTopWindow: boolean
  asEntryPicker: boolean
  specifiedPath: string
  onCurrentPathChange: (path: string) => void
  onPick: (entryList: IEntry[]) => void
  onPickDoubleConfirm: () => void
  onOpenDesktopDirectory: (entry: IEntry) => void
}

export function useWorkArea(props: useWorkAreaProps) {
  const {
    isUserDesktop,
    isTopWindow,
    asEntryPicker,
    specifiedPath,
    onCurrentPathChange,
    onPick,
    onPickDoubleConfirm,
    onOpenDesktopDirectory,
  } = props

  const { t } = useTranslation()

  const [, setOpenEvent] = useRecoilState(openEventState)
  const [, setContextMenuData] = useRecoilState(contextMenuDataState)

  const [locationScrollWatcher, setLocationScrollWatcher] = useState<{ wait: boolean, smooth?: boolean }>({ wait: false })
  const [shiftFromIndex, setShiftFromIndex] = useState(0)

  const lassoRef = useRef(null)
  const containerRef = useRef(null)      // container of containerInner, overflow-y-auto
  const containerInnerRef = useRef(null) // container of entryList, its min-height is consistent with its container

  const {
    kiloSize,
    disabledMap, supportThumbnail, thumbScrollWatcher,
    currentPath, currentRootEntry,
    querying, sizeQuerying, deleting,
    entryList, rootEntryList, favoriteRootEntryList, sharingEntryList,
    isEntryListEmpty,
    folderCount, fileCount,
    editMode, setEditMode,
    filterMode, setFilterMode,
    filterText, setFilterText,
    sideCollapse, handleSideCollapseChange,
    hiddenShow, handleHiddenShowChange,
    gridMode, handleGridModeChange,
    sortType, handleSortChange,
    lastVisitedPath, setLastVisitedPath,
    selectedEntryList, setSelectedEntryList,
    sharingModalShow, setSharingModalShow,
    movementEntryPickerShow, setMovementEntryPickerShow,
    goToPathDialogShow, setGoToPathDialogShow,
    clipboardData, handleClipboardAdd, handleClipboardPaste,
    handleSelectAll, handleDirectorySizeUpdate, handleUploadTaskAdd, 
    handleDirectoryOpen, handleGoFullPath,
    handleNavBack, handleNavForward, handleNavRefresh, handleNavAbort, handleNavToParent,
    handleUploadClick, handleDownloadClick,
    handleShareClick, handleFavoriteClick, handleMove, handleDeleteClick,
  } = useFileExplorer({ containerRef, specifiedPath, isUserDesktop })

  const handleEdit = useCallback((editModeType: EditModeType) => {
    if (editModeType !== EditMode.rename) {
      setSelectedEntryList([])
    }
    setEditMode(editModeType)
  }, [setSelectedEntryList, setEditMode])

  const handleSelectCancel = useCallback((e: any) => {
    const { button, ctrlKey, metaKey, shiftKey, target } = e
    const isOnContextMenu = button === 2
    const isMultipleSelect = ctrlKey || metaKey || shiftKey
    const isOnEntry = !!target.closest('.gagu-entry-node')
    const isRename = editMode === EditMode.rename

    if (isOnContextMenu || isMultipleSelect || isOnEntry || isRename) return

    setSelectedEntryList([])
  }, [editMode, setSelectedEntryList])

  const handleNameSuccess = useCallback(async (entry: IEntry) => {
    setEditMode(null)
    await handleNavRefresh()
    setSelectedEntryList([entry])
    setLocationScrollWatcher({ wait: true, smooth: true })
  }, [handleNavRefresh, setSelectedEntryList, setEditMode])

  const handleNameFail = useCallback((failType: NameFailType) => {
    if (['cancel', 'empty'].includes(failType)) {
      setEditMode(null)
    }
  }, [setEditMode])

  const handleEntryClick = useCallback((e: any, entry: IEntry) => {
    if (editMode) return

    let list = [...selectedEntryList]
    const { ctrlKey, metaKey, shiftKey } = e
    const currentIndex = entryList.findIndex((e) => getIsSameEntry(e, entry))

    if (!shiftKey) {
      setShiftFromIndex(currentIndex)
    }

    if (ctrlKey || metaKey) {
      list = list.find(o => getIsSameEntry(o, entry))
        ? list.filter(o => !getIsSameEntry(o, entry))
        : list.concat(entry)
    } else if (shiftKey) {
      const [start, end] = [shiftFromIndex, currentIndex].sort((a, b) => a > b ? 1 : -1)
      list = entryList.slice(start, end + 1)
    } else {
      list = [entry]
    }
    setSelectedEntryList(list)
  }, [editMode, selectedEntryList, setSelectedEntryList, shiftFromIndex, entryList])

  const handleEntryDoubleClick = useCallback((entry: IEntry) => {
    if (editMode) return
    const { type } = entry
    if (type === EntryType.directory) {
      if (isUserDesktop) {
        onOpenDesktopDirectory(entry)
      } else {
        handleDirectoryOpen(entry)
      }
    } else {
      if (asEntryPicker) {
        onPickDoubleConfirm()
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
        handleDownloadClick()
      }
    }
  }, [editMode, isUserDesktop, onOpenDesktopDirectory, handleDirectoryOpen, asEntryPicker, onPickDoubleConfirm, setOpenEvent, handleDownloadClick])

  const handleLassoSelect = useCallback((info: ILassoInfo) => {
    const entryElements: Element[] = (containerInnerRef.current as any)?.querySelectorAll('.gagu-entry-node')
    if (!entryElements.length) return
    const indexList: number[] = []
    entryElements.forEach((el: any, elIndex) => {
      const isContained = getIsCovered({
        ...info,
        ...pick(el, 'offsetTop', 'offsetLeft', 'offsetWidth', 'offsetHeight'),
      })
      isContained && indexList.push(elIndex)
    })
    const entries = entryList.filter((entry, entryIndex) => indexList.includes(entryIndex))
    setSelectedEntryList(entries)
  }, [setSelectedEntryList, entryList])

  const throttledLassoSelectHandler = useMemo(() => throttle(handleLassoSelect, 60), [handleLassoSelect])

  useLassoSelect({
    binding: !asEntryPicker,
    lassoRef,
    containerRef,
    containerInnerRef,
    onDragging: throttledLassoSelectHandler,
  })

  useDragTransfer({
    containerInnerRef,
    currentPath,
    entryList,
    selectedEntryList,
    onDrop: handleUploadTaskAdd,
    onMove: handleMove,
    onOpen: path => {
      if (isUserDesktop) {
        const entry = entryList.find(entry => getEntryPath(entry) === path)!
        onOpenDesktopDirectory(entry)
      } else {
        handleGoFullPath(path)
      }
    },
  })

  useHotKey({
    binding: isTopWindow && !editMode && !filterMode,
    fnMap: {
      'Meta+Backspace, Shift+Delete': disabledMap.delete ? null : handleDeleteClick,
      'Escape, Escape': () => setSelectedEntryList([]),
      'Meta+KeyA, Ctrl+KeyA': disabledMap.selectAll ? null : () => handleSelectAll(true),
      'Meta+KeyB, Ctrl+KeyB': handleSideCollapseChange,
      'Meta+KeyD, Ctrl+KeyD': disabledMap.download ? null : handleDownloadClick,
      'Enter, F2': disabledMap.rename ? null : () => handleEdit(EditMode.rename),
      'Meta+KeyF, Ctrl+KeyF': disabledMap.filter ? null : () => setFilterMode(true),
      'Meta+KeyG, Ctrl+KeyG': disabledMap.gridView ? null : () => handleGridModeChange(true),
      'Meta+KeyH, Ctrl+KeyH': () => handleHiddenShowChange(!hiddenShow),
      'Meta+KeyL, Ctrl+KeyL': disabledMap.listView ? null : () => handleGridModeChange(false),
      'Meta+Alt+KeyN, Ctrl+Alt+KeyN': disabledMap.createFolder ? null : () => handleEdit(EditMode.createFolder),
      'Meta+KeyR, Ctrl+KeyR': disabledMap.navRefresh ? null : handleNavRefresh,
      'Meta+Alt+KeyT, Ctrl+Alt+KeyT': disabledMap.createText ? null : () => handleEdit(EditMode.createText),
      'Meta+KeyU, Ctrl+KeyU': disabledMap.upload ? null : handleUploadClick,
      'Meta+Shift+KeyG, Ctrl+Shift+KeyG': disabledMap.goTo ? null : () => setGoToPathDialogShow(true),
      'Meta+Shift+ArrowUp, Backspace': disabledMap.navToParent ? null : handleNavToParent,
      'Meta+ArrowRight, Ctrl+ArrowRight': disabledMap.navForward ? null : handleNavForward,
      'Meta+ArrowLeft, Ctrl+ArrowLeft': disabledMap.navBack ? null : handleNavBack,
      'Meta+ArrowDown, Enter': disabledMap.openFolder
        ? null
        : () => handleEntryDoubleClick(selectedEntryList[0]),
      'Meta+KeyC, Ctrl+KeyC': disabledMap.copy
        ? null
        : () => handleClipboardAdd({
          type: ClipboardType.copy,
          entryList: selectedEntryList,
        }),
      'Meta+KeyX, Ctrl+KeyX': disabledMap.cut
        ? null
        : () => handleClipboardAdd({
          type: ClipboardType.cut,
          entryList: selectedEntryList,
        }),
      'Meta+KeyV, Ctrl+KeyV': disabledMap.paste ? null : handleClipboardPaste,
    },
  })

  const handleContextMenu = useCallback((event: any) => {
    if (asEntryPicker) return

    let isOnBlank = true
    let isOnDirectory = false
    let isOnImage = false
    let contextEntryList: IEntry[] = [...selectedEntryList]

    const unconfirmedCount = contextEntryList.length
    const { target, clientX, clientY } = event
    const eventData = { target, clientX, clientY }
    const targetEntryEl = target.closest('.gagu-entry-node')

    if (targetEntryEl) {
      isOnBlank = false

      const targetEntryName = targetEntryEl.getAttribute('data-entry-name')
      const isDirectory = targetEntryEl.getAttribute('data-entry-type') === EntryType.directory
      const foundEntry = entryList.find(o => o.name === targetEntryName)

      if (isDirectory) {
        isOnDirectory = true
      }

      if (BG_EXTENSION_LIST.includes(targetEntryEl.getAttribute('data-entry-extension'))) {
        isOnImage = true
      }

      if (unconfirmedCount <= 1 && foundEntry) {
        contextEntryList = [foundEntry]
        setSelectedEntryList(contextEntryList)
      }
    } else {
      contextEntryList = []
      setSelectedEntryList([])
    }

    const confirmedCount = contextEntryList.length
    const activeEntry = contextEntryList[0]
    const isSingle = confirmedCount === 1
    const isFavorited = isSingle && favoriteRootEntryList.some(entry => getIsSameEntry(entry, activeEntry))

    const menuItemList: IContextMenuItem[] = [
      {
        icon: <SvgIcon.FolderAdd />,
        name: t`action.newFolder`,
        isShow: isOnBlank,
        onClick: () => setTimeout(() => handleEdit(EditMode.createFolder)),
      },
      {
        icon: <SvgIcon.FileAdd />,
        name: t`action.newTextFile`,
        isShow: isOnBlank,
        onClick: () => setTimeout(() => handleEdit(EditMode.createText)),
      },
      {
        icon: <SvgIcon.Refresh />,
        name: t`action.refresh`,
        isShow: isOnBlank,
        onClick: handleNavRefresh,
      },
      {
        icon: <SvgIcon.Rename />,
        name: t`action.rename`,
        isShow: isSingle,
        onClick: () => setTimeout(() => handleEdit(EditMode.rename)),
      },
      {
        icon: <SvgIcon.Apps />,
        name: t`action.openWith`,
        isShow: !isOnDirectory && isSingle,
        onClick: () => { },
        children: CALLABLE_APP_LIST.map(app => ({
          icon: <div className="gagu-app-icon w-4 h-4" data-app-id={app.id} />,
          name: t(`app.${app.id}`),
          onClick: () => setOpenEvent({
            transaction: EventTransaction.run_app,
            appId: app.id,
            entryList: [activeEntry],
            forceOpen: true,
          }),
        })).concat({
          icon: <div className="gagu-app-icon w-4 h-4" data-app-id="iina" />,
          name: 'IINA',
          onClick: () => openInIINA(activeEntry),
        }),
      },
      {
        icon: <SvgIcon.Settings />,
        name: t`action.setAs`,
        isShow: isOnImage && isSingle,
        onClick: () => {},
        children: [
          { name: 'bg-desktop', title: 'Desktop Wallpaper' },
          { name: 'bg-sharing', title: 'Sharing Wallpaper' },
          { name: 'favicon', title: 'Favicon' },
        ].map(o => ({
          icon: <div className="w-4 h-4">⏳</div>,
          // TODO: i18n
          name: t(`${o.title}`),
          onClick: () => toast.error('⏳'),
        }))
      },
      {
        icon: <SvgIcon.FolderInfo />,
        name: t`action.folderSize`,
        isShow: isOnDirectory && isSingle,
        onClick: () => handleDirectorySizeUpdate(activeEntry),
      },
      {
        icon: <SvgIcon.Paste />,
        name: t`action.paste` + ` (${clipboardData?.entryList.length})`,
        isShow: isOnBlank && !!clipboardData,
        onClick: handleClipboardPaste,
      },
      {
        icon: <SvgIcon.Copy />,
        name: t`action.copy`,
        isShow: !!contextEntryList.length,
        onClick: () => handleClipboardAdd({
          type: ClipboardType.copy,
          entryList: contextEntryList,
        }),
      },
      {
        icon: <SvgIcon.Cut />,
        name: t`action.cut`,
        isShow: !!contextEntryList.length,
        onClick: () => handleClipboardAdd({
          type: ClipboardType.cut,
          entryList: contextEntryList,
        }),
      },
      {
        icon: <SvgIcon.MoveTo />,
        name: t`action.moveTo`,
        isShow: !isOnBlank,
        onClick: () => setMovementEntryPickerShow(true),
      },
      {
        icon: isFavorited ? <SvgIcon.Star /> : <SvgIcon.StarSolid />,
        name: isFavorited ? t`action.unfavorite` : t`action.favorite`,
        isShow: isOnDirectory && isSingle,
        onClick: () => handleFavoriteClick(activeEntry),
      },
      {
        icon: <SvgIcon.Run />,
        name: t`action.goTo`,
        isShow: !isUserDesktop && isOnBlank,
        onClick: () => setGoToPathDialogShow(true),
      },
      {
        icon: <SvgIcon.Upload />,
        name: t`action.upload`,
        isShow: isOnBlank,
        onClick: handleUploadClick,
      },
      {
        icon: <SvgIcon.Download />,
        name: t`action.download`,
        isShow: true,
        onClick: () => handleDownloadClick(contextEntryList),
      },
      {
        icon: <SvgIcon.Share />,
        name: t`action.newSharing`,
        isShow: !isOnBlank,
        onClick: () => handleShareClick(contextEntryList),
      },
      {
        icon: <SvgIcon.Delete />,
        name: t`action.delete`,
        isShow: !isOnBlank,
        onClick: () => handleDeleteClick(contextEntryList),
      },
    ]

    setContextMenuData({ eventData, menuItemList })
  }, [
    t,
    asEntryPicker,
    isUserDesktop,
    entryList,
    selectedEntryList,
    favoriteRootEntryList,
    clipboardData,
    handleEdit,
    setContextMenuData,
    setSelectedEntryList,
    setOpenEvent,
    setGoToPathDialogShow,
    setMovementEntryPickerShow,
    handleNavRefresh,
    handleUploadClick,
    handleDirectorySizeUpdate,
    handleClipboardAdd,
    handleClipboardPaste,
    handleFavoriteClick,
    handleDownloadClick,
    handleShareClick,
    handleDeleteClick,
  ])

  useEffect(() => {
    const container: any = containerRef.current
    if (container && locationScrollWatcher.wait && !querying) {
      const target: any = document.querySelector('.gagu-entry-node[data-selected="true"]')
      const top = target ? target.offsetTop - 10 : 0
      container!.scrollTo({ top, behavior: locationScrollWatcher.smooth ? 'smooth' : undefined })
      setLocationScrollWatcher({ wait: false })
      setLastVisitedPath('')
    }
  }, [locationScrollWatcher, querying, setLastVisitedPath])

  useEffect(() => {
    setEditMode(null)
    setSelectedEntryList([])
    setFilterMode(false)
    setFilterText('')
  }, [currentPath, setSelectedEntryList, setFilterMode, setFilterText, setEditMode])

  useEffect(() => {
    const prevEntry = entryList.find((entry) => getEntryPath(entry) === lastVisitedPath)
    if (prevEntry) {
      setSelectedEntryList([prevEntry])
      setLocationScrollWatcher({ wait: true })
    }
  }, [entryList, lastVisitedPath, setSelectedEntryList])

  useEffect(() => {
    onPick(selectedEntryList)
    if (selectedEntryList.length === 0) {
      setShiftFromIndex(0)
    }
  }, [onPick, selectedEntryList])

  useEffect(() => {
    onCurrentPathChange(currentPath)
  }, [onCurrentPathChange, currentPath])

  return {
    kiloSize, clipboardData,
    lassoRef, containerRef, containerInnerRef,
    supportThumbnail, thumbScrollWatcher,
    currentPath, currentRootEntry,
    entryList, selectedEntryList,
    favoriteRootEntryList, rootEntryList, sharingEntryList,
    isEntryListEmpty, disabledMap,
    folderCount, fileCount,
    querying, sizeQuerying, deleting,
    filterMode, setFilterMode,
    filterText, setFilterText,
    sideCollapse, handleSideCollapseChange,
    hiddenShow, handleHiddenShowChange,
    gridMode, handleGridModeChange,
    sortType, handleSortChange,
    sharingModalShow, setSharingModalShow,
    movementEntryPickerShow, setMovementEntryPickerShow,
    goToPathDialogShow, setGoToPathDialogShow,
    editMode, handleEdit, handleNameSuccess, handleNameFail,
    handleEntryClick, handleEntryDoubleClick,
    handleDirectoryOpen, handleGoFullPath,
    handleFavoriteClick, handleMove, handleDeleteClick,
    handleSelectAll, handleSelectCancel,
    handleNavBack, handleNavForward, handleNavRefresh, handleNavAbort, handleNavToParent,
    handleUploadClick, handleDownloadClick, handleContextMenu,
  }
}
