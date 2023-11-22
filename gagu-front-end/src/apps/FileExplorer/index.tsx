import { useCallback, useEffect, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import { useDragSelect, useDragOperations, useHotKey, useFileExplorer } from '../../hooks'
import StatusBar from './StatusBar'
import ControlBar from './ControlBar'
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
  NameFailType,
  EditModeType,
  EditMode,
} from '../../types'
import SharingModal from '../../components/SharingModal'
import { useTranslation } from 'react-i18next'
import EntryNode from './EntryNode'

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
  const [locationScrollWatcher, setLocationScrollWatcher] = useState<{ wait: boolean, smooth?: boolean }>({ wait: false })

  const lassoRef = useRef(null)
  const containerRef = useRef(null)      // container of containerInner, overflow-y-auto
  const containerInnerRef = useRef(null) // container of entryList, its min-height is consistent with its container

  const {
    rootInfo, entryPathMap, disabledMap, thumbScrollWatcher,
    currentPath, activeRootEntry,
    querying, sizeQuerying, deleting,
    entryList, rootEntryList, favoriteEntryList, sharedEntryList,
    isInRoot, isEntryListEmpty,
    folderCount, fileCount,
    editMode, setEditMode,
    filterMode, setFilterMode,
    filterText, setFilterText,
    hiddenShow, handleHiddenShowChange,
    gridMode, handleGridModeChange,
    sortType, handleSortChange,
    lastVisitedPath, setLastVisitedPath,
    selectedEntryList, setSelectedEntryList,
    sharingModalShow, setSharingModalShow,
    handleSelectAll, handleDirectorySizeUpdate, handleUploadTaskAdd, 
    handleRootEntryClick, handleDirectoryOpen, handleGoFullPath,
    handleNavBack, handleNavForward, handleNavRefresh, handleNavAbort, handleNavToParent,
    handleUploadClick, handleDownloadClick,
    handleShareClick, handleFavoriteClick, handleDeleteClick,
  } = useFileExplorer({
    touchMode: false,
    containerRef,
  })

  useEffect(() => setWindowLoading(querying), [setWindowLoading, querying])

  useEffect(() => {
    const title = isInRoot
      ? (activeRootEntry?.name || currentPath)
      : currentPath.split('/').pop() as string
    setWindowTitle(title)
  }, [currentPath, setWindowTitle, isInRoot, activeRootEntry])

  const handleEdit = useCallback((editModeType: EditModeType) => {
    if (editModeType !== EditMode.rename) {
      setSelectedEntryList([])
    }
    setEditMode(editModeType)
  }, [setSelectedEntryList, setEditMode])

  const handleSelectCancel = useCallback((e: any) => {
    const isOnContextMenu = e.button === 2
    const isSameEntry = e.target.closest('.gagu-entry-node')
    const isMultipleSelect = e.metaKey || e.ctrlKey || e.shiftKey
    const isRename = document.getElementById('file-explorer-name-input')

    if (isOnContextMenu || isSameEntry || isMultipleSelect || isRename) return

    setSelectedEntryList([])
  }, [setSelectedEntryList])

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

  const handleEntryClick = useCallback((e: any, entry: IEntry) => {
    if (editMode) return

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
  }, [editMode, selectedEntryList, entryList, setSelectedEntryList])

  const handleEntryDoubleClick = useCallback((entry: IEntry) => {
    if (editMode) return
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
  }, [editMode, entryList, handleDirectoryOpen, handleDownloadClick, setOpenOperation])

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
      handleUploadTaskAdd(nestedFileList, targetDir)
    },
  })

  useHotKey({
    type: 'keyup',
    bindCondition: isTopWindow && !editMode && !filterMode,
    hotKeyMap: {
      'Delete': disabledMap.delete ? null : handleDeleteClick,
      'Escape': () => setSelectedEntryList([]),
      'Shift+A': disabledMap.selectAll ? null : () => handleSelectAll(true),
      'Shift+D': disabledMap.download ? null : handleDownloadClick,
      'Shift+E': disabledMap.rename ? null : () => handleEdit(EditMode.rename),
      'Shift+F': () => setFilterMode(true),
      'Shift+G': () => handleGridModeChange(true),
      'Shift+H': () => handleHiddenShowChange(!hiddenShow),
      'Shift+L': () => handleGridModeChange(false),
      'Shift+N': disabledMap.createFolder ? null : () => handleEdit(EditMode.createFolder),
      'Shift+R': disabledMap.refresh ? null : handleNavRefresh,
      'Shift+T': disabledMap.createText ? null : () => handleEdit(EditMode.createText),
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
        onClick: () => handleEdit(EditMode.createFolder),
      },
      {
        icon: <SvgIcon.FileAdd />,
        name: t`action.newTextFile`,
        isShow: isOnBlank,
        onClick: () => handleEdit(EditMode.createText),
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
        onClick: () => setTimeout(() => handleEdit(EditMode.rename), 0),
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
        onClick: () => handleFavoriteClick(contextEntryList[0], isFavorited),
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
    entryList,
    selectedEntryList,
    favoriteEntryList,
    handleEdit,
    setContextMenuData,
    setSelectedEntryList,
    setOpenOperation,
    handleNavRefresh,
    handleUploadClick,
    handleDirectorySizeUpdate,
    handleFavoriteClick,
    handleDownloadClick,
    handleShareClick,
    handleDeleteClick,
  ])

  return (
    <>
      <div className="absolute inset-0 flex">
        {/* side */}
        <Side
          {...{ sideCollapse, currentPath, rootEntryList, favoriteEntryList }}
          onRootEntryClick={handleRootEntryClick}
          onFavoriteCancel={(entry) => handleFavoriteClick(entry, true)}
        />
        {/* main */}
        <div className="relative flex-grow h-full bg-white flex flex-col">
          <ControlBar
            {...{
              windowWidth,
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
            onNavBack={handleNavBack}
            onNavForward={handleNavForward}
            onNavRefresh={handleNavRefresh}
            onNavAbort={handleNavAbort}
            onNavToParent={handleNavToParent}
            onEdit={handleEdit}
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
              {(editMode === EditMode.createFolder || editMode === EditMode.createText) && (
                <EntryNode
                  creationMode
                  gridMode={gridMode}
                  entry={{
                    name: '',
                    type: editMode === EditMode.createFolder ? 'directory' : 'file',
                    lastModified: 0,
                    hidden: false,
                    hasChildren: false,
                    parentPath: currentPath,
                    extension: editMode === EditMode.createFolder ? '_dir_new' : '_txt_new',
                  }}
                  creationType={editMode === EditMode.createFolder ? EditMode.createFolder : EditMode.createText}
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
                    {...{
                      entry,
                      gridMode,
                      renameMode: editMode === EditMode.rename,
                      isSelected,
                      isFavorited,
                      supportThumbnail,
                      entryPathMap,
                      thumbScrollWatcher,
                    }}
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
      </div>

      <SharingModal
        visible={sharingModalShow}
        entryList={sharedEntryList}
        onClose={() => setSharingModalShow(false)}
      />
      
    </>
  )
}
