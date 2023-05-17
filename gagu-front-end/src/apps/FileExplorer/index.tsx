import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import { useRequest, useDragSelect, useDragOperations, useHotKey } from '../../hooks'
import { FsApi, DownloadApi, TunnelApi } from '../../api'
import BottomBar from './BottomBar'
import ToolBar, { IToolBarDisabledMap } from './ToolBar'
import { NameFailType } from './EntryNode/EntryName'
import Side from './Side'
import { get, pick, throttle } from 'lodash-es'
import { Confirmor, EmptyPanel, SvgIcon } from '../../components/base'
import { CALLABLE_APP_LIST } from '..'
import toast from 'react-hot-toast'
import {
  getDownloadInfo,
  getIsContained,
  isSameEntry,
  entrySorter,
  line,
  getMatchedApp,
  openInIINA,
  getEntryPath,
  DOWNLOAD_PERIOD,
  GEN_THUMBNAIL_IMAGE_LIST,
} from '../../utils'
import {
  contextMenuDataState,
  openOperationState,
  rootInfoState,
  sizeMapState,
  transferTaskListState,
  transferSignalState,
  lastUploadedPathState,
  // entryListMapState,
} from '../../states'
import {
  AppComponentProps,
  EntryType,
  IEntry,
  IRootEntry,
  IVisitHistory,
  IRectInfo,
  INestedFile,
  IContextMenuItem,
  IApp,
  IUploadTransferTask,
  TransferTaskType,
  TransferTaskStatus,
  TunnelType,
} from '../../types'
import ShareModal from '../../components/ShareModal'
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

  const [rootInfo] = useRecoilState(rootInfoState)
  // const [entryListMap, setEntryListMap] =  useRecoilState(entryListMapState)
  const [sizeMap, setSizeMap] = useRecoilState(sizeMapState)
  const [, setOpenOperation] = useRecoilState(openOperationState)
  const [, setContextMenuData] = useRecoilState(contextMenuDataState)
  const [transferTaskList, setTransferTaskList] = useRecoilState(transferTaskListState)
  const [transferSignal, setTransferSignal] = useRecoilState(transferSignalState)
  const [lastUploadedPath] = useRecoilState(lastUploadedPathState)

  const [sideCollapse, setSideCollapse] = useState(false)
  const [currentPath, setCurrentPath] = useState('')
  const [lastVisitedPath, setLastVisitedPath] = useState('')
  const [activeRootEntry, setActiveRootEntry] = useState<IRootEntry | null>(null)
  const [gridMode, setGridMode] = useState(true)
  const [visitHistory, setVisitHistory] = useState<IVisitHistory>({ position: -1, list: [] })
  const [selectedEntryList, setSelectedEntryList] = useState<IEntry[]>([])
  const [newDirMode, setNewDirMode] = useState(false)
  const [newTxtMode, setNewTxtMode] = useState(false)
  const [renameMode, setRenameMode] = useState(false)
  const [filterMode, setFilterMode] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [scrollWaiter, setScrollWaiter] = useState<{ wait: boolean, smooth?: boolean }>({ wait: false })
  const [scrollHook, setScrollHook] = useState({ top: 0, height: 0 })
  const [waitDropToCurrentPath, setWaitDropToCurrentPath] = useState(false)
  const [hiddenShow, setHiddenShow] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [shareModalVisible, setShareModalVisible] = useState(false)
  const [sharedEntryList, setSharedEntryList] = useState<IEntry[]>([])

  const rectRef = useRef(null)
  const containerRef = useRef(null)       // containerInnerRef 的容器，y-scroll-auto
  const containerInnerRef = useRef(null)  // entryList 容器，最小高度与 containerRef 的一致，自动撑高
  const uploadInputRef = useRef(null)

  const { request: queryEntryList, loading: querying, data, setData } = useRequest(FsApi.queryEntryList)
  const { request: deleteEntry, loading: deleting } = useRequest(FsApi.deleteEntry)
  const { request: queryDirectorySize, loading: sizeQuerying } = useRequest(FsApi.queryDirectorySize)
  const { request: createTunnel } = useRequest(TunnelApi.createTunnel)

  const { rootEntryList, rootEntryPathList } = useMemo(() => {
    const { rootEntryList } = rootInfo
    const rootEntryPathList = rootEntryList.map(getEntryPath)
    return { rootEntryList, rootEntryPathList }
  }, [rootInfo])

  const isInRoot = useMemo(() => rootEntryPathList.includes(currentPath), [rootEntryPathList, currentPath])

  useEffect(() => setWindowLoading(querying), [setWindowLoading, querying])

  useEffect(() => {
    const title = isInRoot
      ? (activeRootEntry?.name || currentPath)
      : currentPath.split('/').pop() as string
    setWindowTitle(title)
  }, [currentPath, setWindowTitle, isInRoot, activeRootEntry])

  useEffect(() => {
    const container: any = containerRef.current
    if (!container) return
    const listener = () => {
      const { top, height } = container.getBoundingClientRect()
      setScrollHook({ top, height })
    }
    listener()
    const throttleListener = throttle(listener, 500)
    container.addEventListener('scroll', throttleListener)
    return () => container.removeEventListener('scroll', throttleListener)
  }, [])

  const { entryList, isEntryListEmpty, folderCount, fileCount } = useMemo(() => {
    const list = get(data, 'data') || []
    const allEntryList: IEntry[] = list.sort(entrySorter)
    const ft = filterText.toLowerCase()
    const methodName = ft.startsWith('*') ? 'endsWith' : (ft.endsWith('*') ? 'startsWith' : 'includes')
    const entryList = allEntryList
      .filter(entry => hiddenShow ? true : !entry.hidden)
      .filter(entry => ft
        ? entry.name.toLowerCase()[methodName](ft.replaceAll('*', ''))
        : true
      )
    let folderCount = 0
    let fileCount = 0

    entryList.forEach(({ type }) => type === EntryType.directory ? folderCount++ : fileCount++)

    const entryListCount = entryList.length
    const isEntryListEmpty = entryListCount === 0

    return { entryList, entryListCount, isEntryListEmpty, folderCount, fileCount }
  }, [data, filterText, hiddenShow])

  // useEffect(() => {
  //   const container: any = containerRef.current
  //   if (container) container.scrollTo({ top: 0 })
  // }, [currentPage])

  const disabledMap: IToolBarDisabledMap = useMemo(() => {
    const { position, list } = visitHistory
    return {
      navBack: position <= 0,
      navForward: list.length === position + 1,
      refresh: querying || !currentPath,
      backToParentDirectory: !currentPath || isInRoot,
      newDir: newDirMode || newTxtMode,
      newTxt: newDirMode || newTxtMode,
      rename: selectedEntryList.length !== 1,
      upload: false,
      download: isEntryListEmpty,
      store: false,
      delete: !selectedEntryList.length,
      filter: false,
      selectAll: isEntryListEmpty,
      showHidden: false,
      gridMode: false,
    }
  }, [visitHistory, querying, currentPath, isInRoot, newDirMode, newTxtMode, selectedEntryList, isEntryListEmpty])

  const handleQueryEntryList = useCallback(async (path: string, keepData?: boolean) => {
    if (!path) return
    !keepData && setData(null)
    const controller = new AbortController()
    const config = { signal: controller.signal }
    setAbortController(controller)
    await queryEntryList(path, config)
  }, [setData, queryEntryList])

  const updateHistory = useCallback((direction: 'forward' | 'backward', path?: string) => {
    const map = { forward: 1, backward: -1 }
    const { position: pos, list: li } = visitHistory
    const position: number = pos + map[direction]
    let list = [...li]
    if (direction === 'forward' && path) {
      list = list.filter((i, index) => index < position)
      list.push(path)
    }
    setVisitHistory({ position, list })
  }, [visitHistory])

  const handlePathChange = useCallback((props: {
    path: string
    direction: 'forward' | 'backward'
    pushPath?: boolean
    updateActiveRootEntry?: boolean
  }) => {
    const { path, direction, pushPath, updateActiveRootEntry } = props
    setLastVisitedPath(currentPath)
    setCurrentPath(path)
    abortController?.abort()
    handleQueryEntryList(path)
    updateHistory(direction, pushPath ? path : undefined)
    if (updateActiveRootEntry) {
      const activeEntry = rootEntryList
        .map(entry => ({ path: getEntryPath(entry), entry }))
        .filter(o => path.startsWith(o.path))
        .sort((a, b) => a.path.length > b.path.length ? -1 : 1)[0].entry
      setActiveRootEntry(activeEntry)
    }
  }, [abortController, currentPath, handleQueryEntryList, rootEntryList, updateHistory])

  const handleRootEntryClick = useCallback((rootEntry: IRootEntry) => {
    const path = getEntryPath(rootEntry)
    handlePathChange({ path, direction: 'forward', pushPath: true, updateActiveRootEntry: true })
  }, [handlePathChange])

  const handleDirOpen = useCallback((entry: IEntry) => {
    const path = getEntryPath(entry)
    handlePathChange({ path, direction: 'forward', pushPath: true })
  }, [handlePathChange])

  const handleGoFullPath = useCallback((path: string) => {
    handlePathChange({ path, direction: 'forward', pushPath: true })
  }, [handlePathChange])

  const handleNavBack = useCallback(() => {
    const { position, list } = visitHistory
    const path = list[position - 1]
    handlePathChange({ path, direction: 'backward', updateActiveRootEntry: true })
  }, [visitHistory, handlePathChange])

  const handleNavForward = useCallback(() => {
    const { position, list } = visitHistory
    const path = list[position + 1]
    handlePathChange({ path, direction: 'forward', updateActiveRootEntry: true })
  }, [visitHistory, handlePathChange])

  const handleRefresh = useCallback(async () => {
    setSelectedEntryList([])
    await handleQueryEntryList(currentPath, true)
  }, [handleQueryEntryList, currentPath])

  const handleBackToParentDirectory = useCallback(() => {
    const list = currentPath.split('/')
    list.pop()
    const path = list.join('/')
    handlePathChange({ path, direction: 'forward', pushPath: true })
  }, [currentPath, handlePathChange])

  const handleCreate = useCallback((create: 'dir' | 'txt') => {
    setSelectedEntryList([])
    create === 'dir' ? setNewDirMode(true) : setNewTxtMode(true)
  }, [])

  const handleRename = useCallback(() => setRenameMode(true), [])

  const handleCancelSelect = useCallback((e: any) => {
    if (e.button === 2) return  // oncontextmenu
    if (  // avoid multiple select and rename
      e.metaKey || e.ctrlKey || e.shiftKey ||
      document.getElementById('file-explorer-name-input')
    ) return
    setSelectedEntryList([])
  }, [])

  const handleNameSuccess = useCallback(async (entry: IEntry) => {
    setNewDirMode(false)
    setNewTxtMode(false)
    setRenameMode(false)
    await handleRefresh()
    setSelectedEntryList([entry])
    setScrollWaiter({ wait: true, smooth: true })
  }, [handleRefresh])

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

  const handleDownloadClick = useCallback((contextEntryList?: IEntry[]) => {
    const entryList = contextEntryList || selectedEntryList
    const { message, downloadName } = getDownloadInfo(currentPath, entryList, t)
    Confirmor({
      type: 'download',
      content: message,
      t,
      onConfirm: async (close) => {
        const res = await createTunnel({
          type: TunnelType.download,
          entryList,
          downloadName,
          leftTimes: 1,
          expiredAt: Date.now() + DOWNLOAD_PERIOD,
        })
        if (res && res.success && res.code) {
          DownloadApi.download(res.code)
        } else {
          res && toast.error(res.message)
        }
        close()
      },
    })
  }, [currentPath, selectedEntryList, createTunnel, t])

  const handleShareClick = useCallback((entryList: IEntry[]) => {
    setSharedEntryList(entryList)
    setShareModalVisible(true)
  }, [])

  const handleDeleteClick = useCallback(async (contextEntryList?: IEntry[]) => {
    const processList = contextEntryList || selectedEntryList
    const count = processList.length
    if (!count) return
    const message = count === 1
      ? t('tip.deleteItem', { name: processList[0].name })
      : t('tip.deleteItems', { count })

    Confirmor({
      type: 'delete',
      content: message,
      t,
      onConfirm: async (close) => {
        const successList: boolean[] = []
        for (const entry of processList) {
          const { name } = entry
          const { success } = await deleteEntry(`${currentPath}/${name}`)
          success && document.querySelector(`.gagu-entry-node[data-entry-name="${name}"]`)?.setAttribute('style', 'opacity:0;')
          successList.push(success)
        }
        handleRefresh()
        close()
      },
    })
  }, [deleteEntry, currentPath, selectedEntryList, handleRefresh, t])

  useEffect(() => {
    if (lastUploadedPath.path === currentPath) {
      handleRefresh()
    }
  }, [lastUploadedPath, currentPath, handleRefresh])

  useEffect(() => {
    if (!currentPath && rootEntryList.length) {
      handleRootEntryClick(rootEntryList[0])
    }
  }, [currentPath, rootEntryList, handleRootEntryClick])

  useEffect(() => {
    const container: any = containerRef.current
    if (container && scrollWaiter.wait && !querying) {
      const target: any = document.querySelector('.gagu-entry-node[data-selected="true"]')
      const top = target ? target.offsetTop - 10 : 0
      container!.scrollTo({ top, behavior: scrollWaiter.smooth ? 'smooth' : undefined })
      setScrollWaiter({ wait: false })
      setLastVisitedPath('')
    }
  }, [scrollWaiter, querying])

  useEffect(() => {
    setRenameMode(false)
    setSelectedEntryList([])
    setFilterMode(false)
    setFilterText('')
  }, [currentPath])

  useEffect(() => {
    const prevEntry = entryList.find(({ name, parentPath }) => `${parentPath}/${name}` === lastVisitedPath)
    if (prevEntry) {
      setSelectedEntryList([prevEntry])
      setScrollWaiter({ wait: true })
    }
  }, [entryList, lastVisitedPath])

  useEffect(() => {
    setSelectedEntryList([])
  }, [filterText])

  const updateDirectorySize = useCallback(async (entry: IEntry) => {
    const { name, parentPath } = entry
    const path = `${parentPath}/${name}`
    const { success, data } = await queryDirectorySize(path)
    success && setSizeMap({ ...sizeMap, [path]: data })
  }, [queryDirectorySize, sizeMap, setSizeMap])

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
  }, [newDirMode, newTxtMode, renameMode, selectedEntryList, entryList])

  const handleEntryDoubleClick = useCallback((entry: IEntry) => {
    if (renameMode) return
    const { type, name } = entry
    if (type === EntryType.directory) {
      handleDirOpen(entry)
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
  }, [renameMode, entryList, handleDirOpen, handleDownloadClick, setOpenOperation])

  const handleSelectAll = useCallback((force?: boolean) => {
    const isSelectAll = force || !selectedEntryList.length
    setSelectedEntryList(isSelectAll ? entryList : [])
  }, [setSelectedEntryList, entryList, selectedEntryList])

  const handleRectSelect = useCallback((info: IRectInfo) => {
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
    rectRef,
    containerRef,
    containerInnerRef,
    onDragging: handleRectSelect,
  })

  const addUploadTransferTask = useCallback((nestedFileList: INestedFile[], targetDir?: string) => {
    if (!nestedFileList.length) {
      toast.error(t`tip.noUploadableFilesDetected`)
      return
    }
    const newTaskList: IUploadTransferTask[] = nestedFileList.map(nestedFile => {
      const { name, fullPath } = nestedFile
      const file = nestedFile as File
      const id = `${Date.now()}-${Math.random().toString(36).slice(-8)}`
      const newPath = `${currentPath}${targetDir ? `/${targetDir}` : ''}${fullPath || `/${name}`}`
      return {
        id,
        type: TransferTaskType.upload,
        status: TransferTaskStatus.waiting,
        file,
        newPath,
      }
    })
    setTransferTaskList([...transferTaskList, ...newTaskList])
    setTransferSignal(transferSignal + 1)
  }, [currentPath, transferTaskList, setTransferTaskList, transferSignal, setTransferSignal, t])

  useDragOperations({
    containerInnerRef,
    onEnter: () => {
      setWaitDropToCurrentPath(true)
    },
    onLeave: () => {
      setWaitDropToCurrentPath(false)
    },
    onDrop: (nestedFileList, targetDir) => {
      setWaitDropToCurrentPath(false)
      addUploadTransferTask(nestedFileList, targetDir)
    },
  })

  useHotKey({
    type: 'keyup',
    // bindCondition: isTopWindow && !newDirMode && !newTxtMode && !renameMode && !filterMode && !ContextMenu.isOpen(),
    bindCondition: isTopWindow && !newDirMode && !newTxtMode && !renameMode && !filterMode,
    hotKeyMap: {
      'Delete': disabledMap.delete ? null : handleDeleteClick,
      'Escape': () => setSelectedEntryList([]),
      'Shift+A': disabledMap.selectAll ? null : () => handleSelectAll(true),
      'Shift+D': disabledMap.download ? null : handleDownloadClick,
      'Shift+E': disabledMap.rename ? null : handleRename,
      'Shift+F': disabledMap.filter ? null : () => setFilterMode(true),
      'Shift+G': disabledMap.showHidden ? null : () => setGridMode(true),
      'Shift+H': disabledMap.showHidden ? null : () => setHiddenShow(!hiddenShow),
      'Shift+L': disabledMap.showHidden ? null : () => setGridMode(false),
      'Shift+N': disabledMap.newDir ? null : () => handleCreate('dir'),
      'Shift+R': disabledMap.refresh ? null : handleRefresh,
      'Shift+S': disabledMap.store ? null : null,
      'Shift+T': disabledMap.newTxt ? null : () => handleCreate('txt'),
      'Shift+U': disabledMap.upload ? null : handleUploadClick,
      'Shift+ArrowUp': disabledMap.backToParentDirectory ? null : handleBackToParentDirectory,
      'Shift+ArrowRight': disabledMap.navForward ? null : handleNavForward,
      'Shift+ArrowLeft': disabledMap.navBack ? null : handleNavBack,
      'Shift+ArrowDown': (selectedEntryList.length === 1 && selectedEntryList[0].type === EntryType.directory)
        ? () => handleDirOpen(selectedEntryList[0])
        : null,
    },
  })

  const handleContextMenu = useCallback((event: any) => {
    let isOnBlank = true
    let isOnDir = false
    let isOnImage = false
    let contextEntryList: IEntry[] = [...selectedEntryList]

    const unconfirmedLen = contextEntryList.length
    const { target, clientX, clientY } = event
    const targetEntry = target.closest('.gagu-entry-node')
    const eventData = { target, clientX, clientY }

    if (targetEntry) {
      isOnBlank = false

      const isDir = targetEntry.getAttribute('data-is-directory') === 'true'
      const entryName = targetEntry.getAttribute('data-entry-name')
      const entry = entryList.find(o => o.name === entryName)

      if (isDir) isOnDir = true
      if (GEN_THUMBNAIL_IMAGE_LIST.includes(targetEntry.getAttribute('data-extension'))) {
        isOnImage = true
      }
      if (unconfirmedLen <= 1 && entry) {
        contextEntryList = [entry]
        setSelectedEntryList(contextEntryList)
      }
    } else {
      setSelectedEntryList([])
    }

    const confirmedLen = contextEntryList.length
    const isSingleConfirmed = confirmedLen === 1

    const handleOpenEntry = (app: IApp) => {
      // const matchedEntryList = contextEntryList.filter(en => app.matchList?.includes(en.extension))
      // const activeEntryIndex = matchedEntryList.findIndex(en => en.name === name)
      setOpenOperation({
        app,
        matchedEntryList: contextEntryList,
        activeEntryIndex: 0,
      })
    }

    const menuItemList: IContextMenuItem[] = [
      {
        icon: <SvgIcon.FolderAdd />,
        label: t`action.newFolder`,
        isShow: isOnBlank,
        onClick: () => setNewDirMode(true),
      },
      {
        icon: <SvgIcon.FileAdd />,
        label: t`action.newTextFile`,
        isShow: isOnBlank,
        onClick: () => setNewTxtMode(true),
      },
      {
        icon: <SvgIcon.Refresh />,
        label: t`action.refresh`,
        isShow: isOnBlank,
        onClick: handleRefresh,
      },
      {
        icon: <SvgIcon.Rename />,
        label: t`action.rename`,
        isShow: isSingleConfirmed,
        onClick: () => setTimeout(handleRename, 0),
      },
      {
        icon: <SvgIcon.Apps />,
        label: t`action.openWith`,
        isShow: !isOnDir && isSingleConfirmed,
        onClick: () => { },
        children: CALLABLE_APP_LIST.map(app => ({
          icon: <div className="gagu-app-icon w-4 h-4" data-app-id={app.id} />,
          label: t(`app.${app.id}`),
          onClick: () => handleOpenEntry(app),
        })).concat({
          icon: <div className="gagu-app-icon w-4 h-4" data-app-id="iina" />,
          label: 'IINA',
          onClick: () => openInIINA(contextEntryList[0]),
        }),
      },
      {
        icon: <SvgIcon.Settings />,
        label: t`action.setAs`,
        isShow: isOnImage,
        onClick: () => {},
        children: [
          { name: 'bg-desktop', title: 'Desktop Wallpaper' },
          { name: 'bg-sharing', title: 'Sharing Wallpaper' },
          { name: 'favicon', title: 'Favicon' },
        ].map(o => ({
          icon: <div className="w-4 h-4">⏳</div>,
          label: t(`${o.title}`),
          onClick: () => toast.error('⏳'),
        }))
      },
      {
        icon: <SvgIcon.FolderInfo />,
        label: t`action.folderSize`,
        isShow: isOnDir,
        onClick: () => updateDirectorySize(contextEntryList[0]),
      },
      {
        icon: <SvgIcon.Upload />,
        label: t`action.upload`,
        isShow: isOnBlank,
        onClick: handleUploadClick,
      },
      {
        icon: <SvgIcon.Download />,
        label: t`action.download`,
        isShow: true,
        onClick: () => handleDownloadClick(contextEntryList),
      },
      {
        icon: <SvgIcon.Share />,
        label: t`action.newSharing`,
        isShow: !isOnBlank,
        onClick: () => handleShareClick(contextEntryList),
      },
      {
        icon: <SvgIcon.Delete />,
        label: t`action.delete`,
        isShow: !isOnBlank,
        onClick: () => handleDeleteClick(contextEntryList),
      },
    ]

    setContextMenuData({ eventData, menuItemList })
  }, [
    entryList,
    selectedEntryList,
    updateDirectorySize,
    setContextMenuData,
    setOpenOperation,
    handleRefresh,
    handleRename,
    handleUploadClick,
    handleDownloadClick,
    handleDeleteClick,
    handleShareClick,
    t,
  ])

  return (
    <>
      <div className="absolute inset-0 flex">
        {/* side */}
        <Side
          {...{ sideCollapse, currentPath, activeRootEntry, rootEntryList }}
          onRootEntryClick={handleRootEntryClick}
        />
        {/* main */}
        <div className="relative flex-grow h-full bg-white flex flex-col">
          <ToolBar
            {...{ windowWidth, disabledMap, gridMode, filterMode, filterText, hiddenShow }}
            {...{ setGridMode, setFilterMode, setFilterText, setHiddenShow }}
            onNavBack={handleNavBack}
            onNavForward={handleNavForward}
            onRefresh={handleRefresh}
            onAbort={() => abortController?.abort()}
            onBackToTop={handleBackToParentDirectory}
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
            data-drag-hover={waitDropToCurrentPath}
            className="relative flex-grow overflow-x-hidden overflow-y-auto select-none"
            onMouseDownCapture={handleCancelSelect}
          >
            <div
              ref={rectRef}
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
                const thumbnailSupported = rootInfo.thumbnailSupported
                return (
                  <EntryNode
                    key={encodeURIComponent(`${entry.name}-${entry.type}`)}
                    {...{ entry, gridMode, renameMode, isSelected, thumbnailSupported, sizeMap, scrollHook }}
                    requestState={{
                      deleting,
                      sizeQuerying,
                    }}
                    onClick={handleEntryClick}
                    onDoubleClick={handleEntryDoubleClick}
                    onNameSuccess={handleNameSuccess}
                    onNameFail={handleNameFail}
                  />
                )
              })}
            </div>
          </div>
          <BottomBar
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

      <ShareModal
        visible={shareModalVisible}
        entryList={sharedEntryList}
        onClose={() => setShareModalVisible(false)}
      />
      
    </>
  )
}
