import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import { useDragSelect, useDragOperations, useHotKey } from '../../hooks'
import StatusBar from './StatusBar'
import ControlBar, { IControlBarDisabledMap } from './ControlBar'
import { NameFailType } from './EntryNode/EntryName'
import Side from './Side'
import { pick } from 'lodash-es'
import { EmptyPanel, SvgIcon } from '../../components/common'
import { CALLABLE_APP_LIST } from '..'
import toast from 'react-hot-toast'
import {
  getIsContained,
  isSameEntry,
  line,
  getMatchedApp,
  openInIINA,
  getEntryPath,
  GEN_THUMBNAIL_IMAGE_LIST,
} from '../../utils'
import { contextMenuDataState, openOperationState } from '../../states'
import {
  AppComponentProps,
  EntryType,
  IEntry,
  IRectInfo,
  IContextMenuItem,
  IApp,
} from '../../types'
import SharingModal from '../../components/SharingModal'
import { useTranslation } from 'react-i18next'
import EntryNode from './EntryNode'
import useFileExplorer from '../../hooks/useFileExplorer'

export default function FileExplorer(props: AppComponentProps) {

  const {
    isTopWindow,
    windowSize: { width: windowWidth },
    setWindowTitle,
    setWindowLoading,
  } = props

  const { t } = useTranslation()

  const [, setOpenOperation] = useRecoilState(openOperationState)
  const [, setContextMenuData] = useRecoilState(contextMenuDataState)

  const [sideCollapse, setSideCollapse] = useState(false)
  const [newDirMode, setNewDirMode] = useState(false)
  const [newTxtMode, setNewTxtMode] = useState(false)
  const [renameMode, setRenameMode] = useState(false)
  const [filterMode, setFilterMode] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [hiddenShow, setHiddenShow] = useState(false)
  const [scrollWaiter, setScrollWaiter] = useState<{ wait: boolean, smooth?: boolean }>({ wait: false })

  const lassoRef = useRef(null)
  const containerRef = useRef(null)       // containerInnerRef 的容器，y-scroll-auto
  const containerInnerRef = useRef(null)  // entryList 容器，最小高度与 containerRef 的一致，自动撑高
  const uploadInputRef = useRef(null)

  const {
    rootInfo, entryPathMap, currentPath, activeRootEntry, lastVisitedPath, setLastVisitedPath,
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

  useEffect(() => setWindowLoading(querying), [setWindowLoading, querying])

  useEffect(() => {
    const title = isInRoot
      ? (activeRootEntry?.name || currentPath)
      : currentPath.split('/').pop() as string
    setWindowTitle(title)
  }, [currentPath, setWindowTitle, isInRoot, activeRootEntry])

  const disabledMap = useMemo(() => {
    const { position, list } = visitHistory
    const disabledMap: IControlBarDisabledMap = {
      navBack: position <= 0,
      navForward: list.length === position + 1,
      refresh: querying || !currentPath,
      navToParent: !currentPath || isInRoot,
      newDir: newDirMode || newTxtMode,
      newTxt: newDirMode || newTxtMode,
      rename: selectedEntryList.length !== 1,
      upload: false,
      download: isEntryListEmpty,
      delete: !selectedEntryList.length,
      selectAll: isEntryListEmpty,
    }
    return disabledMap
  }, [visitHistory, querying, currentPath, isInRoot, newDirMode, newTxtMode, selectedEntryList, isEntryListEmpty])

  const handleCreate = useCallback((create: 'dir' | 'txt') => {
    setSelectedEntryList([])
    create === 'dir' ? setNewDirMode(true) : setNewTxtMode(true)
  }, [setSelectedEntryList])

  const handleRename = useCallback(() => setRenameMode(true), [])

  const handleSelectCancel = useCallback((e: any) => {
    // oncontextmenu or same one entry
    if (e.button === 2 || e.target.closest('.gagu-entry-node')) return

    // avoid multiple select and rename
    if (
      e.metaKey || e.ctrlKey || e.shiftKey ||
      document.getElementById('file-explorer-name-input')
    ) return
    setSelectedEntryList([])
  }, [setSelectedEntryList])

  const handleNameSuccess = useCallback(async (entry: IEntry) => {
    setNewDirMode(false)
    setNewTxtMode(false)
    setRenameMode(false)
    await handleNavRefresh()
    setSelectedEntryList([entry])
    setScrollWaiter({ wait: true, smooth: true })
  }, [handleNavRefresh, setSelectedEntryList])

  const handleNameFail = useCallback((failType: NameFailType) => {
    if (['cancel', 'empty'].includes(failType)) {
      setNewDirMode(false)
      setNewTxtMode(false)
      setRenameMode(false)
    }
  }, [])

  const handleUploadClick = useCallback(() => {
    (uploadInputRef.current as any)?.click()
  }, [])

  useEffect(() => {
    const container: any = containerRef.current
    if (container && scrollWaiter.wait && !querying) {
      const target: any = document.querySelector('.gagu-entry-node[data-selected="true"]')
      const top = target ? target.offsetTop - 10 : 0
      container!.scrollTo({ top, behavior: scrollWaiter.smooth ? 'smooth' : undefined })
      setScrollWaiter({ wait: false })
      setLastVisitedPath('')
    }
  }, [scrollWaiter, querying, setLastVisitedPath])

  useEffect(() => {
    setRenameMode(false)
    setSelectedEntryList([])
    setFilterMode(false)
    setFilterText('')
  }, [currentPath, setSelectedEntryList])

  useEffect(() => {
    const prevEntry = entryList.find((entry) => getEntryPath(entry) === lastVisitedPath)
    if (prevEntry) {
      setSelectedEntryList([prevEntry])
      setScrollWaiter({ wait: true })
    }
  }, [entryList, lastVisitedPath, setSelectedEntryList])

  const handleEntryClick = useCallback((e: any, entry: IEntry) => {
    if (newDirMode || newTxtMode || renameMode) return
    let list = [...selectedEntryList]
    const { metaKey, ctrlKey, shiftKey } = e
    const selectedLen = selectedEntryList.length
    if (metaKey || ctrlKey) {
      list = list.find(o => isSameEntry(o, entry))
        ? list.filter(o => !isSameEntry(o, entry))
        : list.concat(entry)
    } else if (shiftKey) {
      if (selectedLen) {
        const lastSelectedEntry = selectedEntryList[selectedLen - 1]
        const range: number[] = []
        entryList.forEach((_entry, _entryIndex) => {
          if ([entry, lastSelectedEntry].find(o => isSameEntry(o, _entry))) {
            range.push(_entryIndex)
          }
        })
        range.sort((a, b) => a > b ? 1 : -1)
        const [start, end] = range
        list = entryList.slice(start, end + 1)
      } else {
        list = [entry]
      }
    } else {
      list = [entry]
    }
    setSelectedEntryList(list)
  }, [newDirMode, newTxtMode, renameMode, selectedEntryList, entryList, setSelectedEntryList])

  const handleEntryDoubleClick = useCallback((entry: IEntry) => {
    if (renameMode) return
    const { type, name } = entry
    if (type === 'directory') {
      handleDirectoryOpen(entry)
    } else {
      const app = getMatchedApp(entry)
      if (app) {
        const matchedEntryList = entryList.filter(en => app.matchList?.includes(en.extension))
        const activeEntryIndex = matchedEntryList.findIndex(en => en.name === name)
        setOpenOperation({
          app,
          matchedEntryList,
          activeEntryIndex,
        })
      } else {
        handleDownloadClick()
      }
    }
  }, [renameMode, entryList, handleDirectoryOpen, handleDownloadClick, setOpenOperation])

  const handleLassoSelect = useCallback((info: IRectInfo) => {
    const entryElements = document.querySelectorAll('.gagu-entry-node')
    if (!entryElements.length) return
    const indexList: number[] = []
    entryElements.forEach((el: any, elIndex) => {
      const isContained = getIsContained({
        ...info,
        ...pick(el, 'offsetTop', 'offsetLeft', 'offsetWidth', 'offsetHeight'),
      })
      isContained && indexList.push(elIndex)
    })
    const names = entryList.filter((n, nIndex) => indexList.includes(nIndex))
    setSelectedEntryList(names)
  }, [setSelectedEntryList, entryList])

  useDragSelect({
    lassoRef,
    containerRef,
    containerInnerRef,
    onDragging: handleLassoSelect,
  })

  useDragOperations({
    containerInnerRef,
    entryList,
    selectedEntryList,
    onDrop: (nestedFileList, targetDir) => {
      addUploadTransferTask(nestedFileList, targetDir)
    },
  })

  useHotKey({
    type: 'keyup',
    bindCondition: isTopWindow && !newDirMode && !newTxtMode && !renameMode && !filterMode,
    hotKeyMap: {
      'Delete': disabledMap.delete ? null : handleDeleteClick,
      'Escape': () => setSelectedEntryList([]),
      'Shift+A': disabledMap.selectAll ? null : () => handleSelectAll(true),
      'Shift+D': disabledMap.download ? null : handleDownloadClick,
      'Shift+E': disabledMap.rename ? null : handleRename,
      'Shift+F': () => setFilterMode(true),
      'Shift+G': () => handleGridModeChange(true),
      'Shift+H': () => setHiddenShow(!hiddenShow),
      'Shift+L': () => handleGridModeChange(false),
      'Shift+N': disabledMap.newDir ? null : () => handleCreate('dir'),
      'Shift+R': disabledMap.refresh ? null : handleNavRefresh,
      'Shift+T': disabledMap.newTxt ? null : () => handleCreate('txt'),
      'Shift+U': disabledMap.upload ? null : handleUploadClick,
      'Shift+ArrowUp': disabledMap.navToParent ? null : handleNavToParent,
      'Shift+ArrowRight': disabledMap.navForward ? null : handleNavForward,
      'Shift+ArrowLeft': disabledMap.navBack ? null : handleNavBack,
      'Shift+ArrowDown': (selectedEntryList.length === 1 && selectedEntryList[0].type === 'directory')
        ? () => handleDirectoryOpen(selectedEntryList[0])
        : null,
    },
  })

  const handleContextMenu = useCallback((event: any) => {
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

      if (GEN_THUMBNAIL_IMAGE_LIST.includes(targetEntryEl.getAttribute('data-entry-extension'))) {
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
    const isSingle = confirmedCount === 1
    const isFavorited = isSingle && favoriteEntryList.some(entry => isSameEntry(entry, contextEntryList[0]))

    const handleOpenEntry = (app: IApp) => {
      setOpenOperation({
        app,
        matchedEntryList: contextEntryList,
        activeEntryIndex: 0,
      })
    }

    const menuItemList: IContextMenuItem[] = [
      {
        icon: <SvgIcon.FolderAdd />,
        name: t`action.newFolder`,
        isShow: isOnBlank,
        onClick: () => setNewDirMode(true),
      },
      {
        icon: <SvgIcon.FileAdd />,
        name: t`action.newTextFile`,
        isShow: isOnBlank,
        onClick: () => setNewTxtMode(true),
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
        onClick: () => setTimeout(handleRename, 0),
      },
      {
        icon: <SvgIcon.Apps />,
        name: t`action.openWith`,
        isShow: !isOnDirectory && isSingle,
        onClick: () => { },
        children: CALLABLE_APP_LIST.map(app => ({
          icon: <div className="gagu-app-icon w-4 h-4" data-app-id={app.id} />,
          name: t(`app.${app.id}`),
          onClick: () => handleOpenEntry(app),
        })).concat({
          icon: <div className="gagu-app-icon w-4 h-4" data-app-id="iina" />,
          name: 'IINA',
          onClick: () => openInIINA(contextEntryList[0]),
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
        onClick: () => handleDirectorySizeUpdate(contextEntryList[0]),
      },
      {
        icon: isFavorited ? <SvgIcon.Star /> : <SvgIcon.StarSolid />,
        name: isFavorited ? t`action.unfavorite` : t`action.favorite`,
        isShow: isOnDirectory && isSingle,
        onClick: () => handleFavorite(contextEntryList[0], isFavorited),
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
  }, [selectedEntryList, favoriteEntryList, t, handleNavRefresh, handleUploadClick, setContextMenuData, entryList, setOpenOperation, handleRename, handleDirectorySizeUpdate, handleFavorite, handleDownloadClick, handleShareClick, handleDeleteClick, setSelectedEntryList])

  return (
    <>
      <div className="absolute inset-0 flex">
        {/* side */}
        <Side
          {...{ sideCollapse, currentPath, rootEntryList, favoriteEntryList }}
          onRootEntryClick={handleRootEntryClick}
          onFavoriteCancel={(entry) => handleFavorite(entry, true)}
        />
        {/* main */}
        <div className="relative flex-grow h-full bg-white flex flex-col">
          <ControlBar
            {...{ windowWidth, disabledMap, gridMode, filterMode, filterText, hiddenShow, sortType }}
            {...{ setFilterMode, setFilterText, setHiddenShow }}
            onGridModeChange={handleGridModeChange}
            onSortTypeChange={handleSortChange}
            onNavBack={handleNavBack}
            onNavForward={handleNavForward}
            onNavRefresh={handleNavRefresh}
            onNavAbort={handleNavAbort}
            onNavToParent={handleNavToParent}
            onNewDir={() => handleCreate('dir')}
            onNewTxt={() => handleCreate('txt')}
            onRename={handleRename}
            onUpload={handleUploadClick}
            onDownload={handleDownloadClick}
            onDelete={handleDeleteClick}
            onSelectAll={handleSelectAll}
          />
          <div
            title={sideCollapse ? t`action.unfold` : t`action.fold`}
            className={line(`
              absolute z-10 top-1/2 left-0 w-2 h-12 bg-gray-200 rounded-r-sm
              opacity-40 hover:bg-gray-300
              transition-all duration-200 -translate-y-1/2 cursor-pointer
              flex justify-center items-center
            `)}
            onClick={() => setSideCollapse(!sideCollapse)}
          >
            <span className={sideCollapse ? '' : '-rotate-180'}>
              <SvgIcon.ChevronRight />
            </span>
          </div>
          <div
            ref={containerRef}
            className="relative flex-grow overflow-x-hidden overflow-y-auto select-none"
            onMouseDownCapture={handleSelectCancel}
          >
            <div
              ref={lassoRef}
              className="hidden absolute z-10 border box-content border-gray-400 bg-black bg-opacity-10 pointer-events-none"
            />

            <EmptyPanel show={!querying && isEntryListEmpty} />

            <div
              ref={containerInnerRef}
              className={line(`
                gagu-entry-list-container
                relative min-h-full flex flex-wrap content-start
                ${gridMode ? 'p-2' : 'p-4'}
              `)}
              onContextMenu={handleContextMenu}
            >
              {/* create */}
              {(newDirMode || newTxtMode) && (
                <EntryNode
                  creationMode
                  gridMode={gridMode}
                  entry={{
                    name: '',
                    type: newDirMode ? 'directory' : 'file',
                    lastModified: 0,
                    hidden: false,
                    hasChildren: false,
                    parentPath: currentPath,
                    extension: newDirMode ? '_dir_new' : '_txt_new',
                  }}
                  creationType={newDirMode ? 'dir' : 'txt'}
                  onNameSuccess={handleNameSuccess}
                  onNameFail={handleNameFail}
                />
              )}

              {/* entry list */}
              {entryList.map(entry => {
                const isSelected = selectedEntryList.some(o => isSameEntry(o, entry))
                const isFavorited = favoriteEntryList.some(o => isSameEntry(o, entry))
                const supportThumbnail = rootInfo.serverOS.supportThumbnail
                return (
                  <EntryNode
                    key={encodeURIComponent(`${entry.name}-${entry.type}`)}
                    {...{ entry, gridMode, renameMode, isSelected, isFavorited, supportThumbnail, entryPathMap, scrollHook }}
                    requestState={{ deleting, sizeQuerying }}
                    onClick={handleEntryClick}
                    onDoubleClick={handleEntryDoubleClick}
                    onNameSuccess={handleNameSuccess}
                    onNameFail={handleNameFail}
                  />
                )
              })}
            </div>
          </div>
          <StatusBar
            {...{ folderCount, fileCount, currentPath, rootEntry: activeRootEntry, selectedEntryList }}
            loading={querying}
            onDirClick={handleGoFullPath}
            onRootEntryClick={handleRootEntryClick}
          />
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
      
    </>
  )
}
