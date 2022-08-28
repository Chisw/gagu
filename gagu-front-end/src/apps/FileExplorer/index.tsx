import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import EntryIcon from './EntryIcon'
import { useFetch, useDragSelect, useDragOperations, useShortcuts } from '../../hooks'
import { FsApi } from '../../api'
import PathLink from './PathLink'
import ToolBar, { IToolBarDisabledMap } from './ToolBar'
import NameLine, { NameFailType } from './NameLine'
import { DateTime } from 'luxon'
import toast from 'react-hot-toast'
import Confirmor, { ConfirmorProps } from '../../components/Confirmor'
import Side from './Side'
import { pick, throttle } from 'lodash'
import { Pagination, SvgIcon } from '../../components/base'
import { CALLABLE_APP_LIST } from '../../utils/appList'
import {
  getReadableSize,
  getDownloadInfo,
  getIsContained,
  isSameEntry,
  entrySorter,
  line,
  getMatchedApp,
  openInIINA,
  getRootEntryPath,
  MAX_PAGE_SIZE,
} from '../../utils'
import {
  contextMenuDataState,
  openOperationState,
  rootInfoState,
  sizeMapState,
  uploadTaskListState,
} from '../../utils/state'
import {
  AppComponentProps,
  EntryType,
  IEntry,
  IRootEntry,
  IHistory,
  IRectInfo,
  INestedFile,
  IUploadTask,
  IContextMenuItem,
  IApp,
} from '../../utils/types'

export default function FileExplorer(props: AppComponentProps) {

  const { isTopWindow, setWindowTitle, setWindowLoading } = props

  const [rootInfo] = useRecoilState(rootInfoState)
  const [sizeMap, setSizeMap] = useRecoilState(sizeMapState)
  const [, setOpenOperation] = useRecoilState(openOperationState)
  const [uploadTaskList, setUploadTaskList] = useRecoilState(uploadTaskListState)
  const [, setContextMenuData] = useRecoilState(contextMenuDataState)

  const [sideCollapse, setSideCollapse] = useState(false)
  const [currentPath, setCurrentPath] = useState('')
  const [prevDirPath, setPrevDirPath] = useState('')
  const [activeRootEntry, setActiveRootEntry] = useState<IRootEntry | null>(null)
  const [gridMode, setGridMode] = useState(true)
  const [history, setHistory] = useState<IHistory>({ position: -1, list: [] })
  const [selectedEntryList, setSelectedEntryList] = useState<IEntry[]>([])
  const [newDirMode, setNewDirMode] = useState(false)
  const [newTxtMode, setNewTxtMode] = useState(false)
  const [renameMode, setRenameMode] = useState(false)
  const [filterMode, setFilterMode] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [scrollWaiter, setScrollWaiter] = useState<{ wait: boolean, smooth?: boolean }>({ wait: false })
  const [scrollHook, setScrollHook] = useState({ top: 0, height: 0 })
  const [waitDropToCurrentPath, setWaitDropToCurrentPath] = useState(false)
  const [downloadConfirmorProps, setDownloadConfirmorProps] = useState<ConfirmorProps>({ isOpen: false })
  const [deleteConfirmorProps, setDeleteConfirmorProps] = useState<ConfirmorProps>({ isOpen: false })
  const [hiddenShow, setHiddenShow] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [uploadInfo, setUploadInfo] = useState({ ratio: 0, speed: '' })
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const rectRef = useRef(null)
  const containerRef = useRef(null)       // containerInnerRef 的容器，y-scroll-auto
  const containerInnerRef = useRef(null)  // entryList 容器，最小高度与 containerRef 的一致，自动撑高
  const uploadInputRef = useRef(null)

  const { fetch: getEntryList, loading: fetching, data, setData } = useFetch(FsApi.getEntryList)
  const { fetch: deleteEntry, loading: deleting } = useFetch(FsApi.deleteEntry)
  const { fetch: uploadFile, loading: uploading } = useFetch(FsApi.uploadFile)
  const { fetch: getDirectorySize, loading: getting } = useFetch(FsApi.getDirectorySize)

  const { rootEntryList, rootEntryPathList } = useMemo(() => {
    const { rootEntryList } = rootInfo
    const rootEntryPathList = rootEntryList.map(getRootEntryPath)
    return { rootEntryList, rootEntryPathList }
  }, [rootInfo])

  const isInRoot = useMemo(() => rootEntryPathList.includes(currentPath), [rootEntryPathList, currentPath])

  useEffect(() => {
    const title = isInRoot
      ? currentPath
      : currentPath.split('/').pop() as string
    setWindowTitle(title)
  }, [currentPath, setWindowTitle, isInRoot])

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

  const { entryList, entryListLen, showPagination, isEntryListEmpty, folderCount, fileCount } = useMemo(() => {
    const allEntryList: IEntry[] = data?.entryList.sort(entrySorter) || []
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

    const entryListLen = entryList.length
    const showPagination = entryListLen > MAX_PAGE_SIZE
    const isEntryListEmpty = entryListLen === 0

    return { entryList, entryListLen, showPagination, isEntryListEmpty, folderCount, fileCount }
  }, [data, filterText, hiddenShow])

  const displayEntryList = useMemo(() => {
    const start = (currentPage - 1) * MAX_PAGE_SIZE
    const end = start + MAX_PAGE_SIZE
    return entryList.slice(start, end)
  }, [entryList, currentPage])

  useEffect(() => {
    const container: any = containerRef.current
    if (container) container.scrollTo({ top: 0 })
  }, [currentPage])

  const disabledMap: IToolBarDisabledMap = useMemo(() => {
    const { position, list } = history
    return {
      navBack: position <= 0,
      navForward: list.length === position + 1,
      refresh: fetching || !currentPath,
      backToTop: !currentPath || isInRoot,
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
  }, [history, fetching, currentPath, isInRoot, newDirMode, newTxtMode, selectedEntryList, isEntryListEmpty])

  const fetchPathData = useCallback((path: string, keepData?: boolean) => {
    !keepData && setData(null)
    const controller = new AbortController()
    const config = { signal: controller.signal }
    getEntryList(path, config)
    setAbortController(controller)
    setNewDirMode(false)
  }, [setData, getEntryList])

  const updateHistory = useCallback((direction: 'forward' | 'back', path?: string) => {
    const map = { forward: 1, back: -1 }
    const { position: pos, list: li } = history
    const position: number = pos + map[direction]
    let list = [...li]
    if (direction === 'forward' && path) {
      list = list.filter((i, index) => index < position)
      list.push(path)
    }
    setHistory({ position, list })
  }, [history])

  const handlePathChange = useCallback((props: {
    path: string
    direction: 'forward' | 'back'
    pushPath?: boolean
    updateActiveRootEntry?: boolean
  }) => {
    abortController && abortController.abort()
    const { path, direction, pushPath, updateActiveRootEntry } = props
    setPrevDirPath(currentPath)
    setCurrentPath(path)
    fetchPathData(path)
    updateHistory(direction, pushPath ? path : undefined)
    if (updateActiveRootEntry) {
      const activeEntry = rootEntryList
        .map(entry => ({ path: getRootEntryPath(entry), entry }))
        .filter(o => path.startsWith(o.path))
        .sort((a, b) => a.path.length > b.path.length ? -1 : 1)[0].entry
      setActiveRootEntry(activeEntry)
    }
  }, [abortController, currentPath, fetchPathData, rootEntryList, updateHistory])

  const handleRootEntryClick = useCallback((rootEntry: IRootEntry) => {
    const { name, parentPath } = rootEntry
    const path = `${parentPath ? `${parentPath}/` : ''}${name}`
    handlePathChange({ path, direction: 'forward', pushPath: true, updateActiveRootEntry: true })
  }, [handlePathChange])

  const handleDirOpen = useCallback((entry: IEntry) => {
    const { name, parentPath } = entry
    const path = `${parentPath}/${name}`
    handlePathChange({ path, direction: 'forward', pushPath: true })
  }, [handlePathChange])

  const handleGoFullPath = useCallback((path: string) => {
    handlePathChange({ path, direction: 'forward', pushPath: true })
  }, [handlePathChange])

  const handleNavBack = useCallback(() => {
    const { position, list } = history
    const path = list[position - 1]
    handlePathChange({ path, direction: 'back', updateActiveRootEntry: true })
  }, [history, handlePathChange])

  const handleNavForward = useCallback(() => {
    const { position, list } = history
    const path = list[position + 1]
    handlePathChange({ path, direction: 'forward', updateActiveRootEntry: true })
  }, [history, handlePathChange])

  const handleRefresh = useCallback(() => {
    setSelectedEntryList([])
    fetchPathData(currentPath, true)
  }, [fetchPathData, currentPath])

  const handleBackToTop = useCallback(() => {
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

  const handleUploadStart = useCallback(async (nestedFileList: INestedFile[], destDir?: string) => {
    if (!nestedFileList.length) {
      toast.error('无有效文件')
      return
    }
    const newTaskList: IUploadTask[] = nestedFileList.map(nestedFile => ({
      id: Math.random().toString(36).slice(-8),
      nestedFile,
      destDir,
      status: 'waiting',
    }))

    let allTaskList = [...uploadTaskList, ...newTaskList]

    setUploadTaskList(allTaskList)

    const successList: boolean[] = []
    for (const nestedFile of nestedFileList) {
      const parentPath = `${currentPath}${destDir ? `/${destDir}` : ''}`
      let lastUpload = { time: Date.now(), size: 0 }

      const onUploadProgress = (e: ProgressEvent) => {
        const { loaded, total } = e
        const { time, size } = lastUpload
        const now = Date.now()
        const interval = (now - time) / 1000
        const delta = loaded - size
        const speed = getReadableSize(delta / interval, { keepFloat: true }) + '/s'
        setUploadInfo({ ratio: loaded / total, speed })
        lastUpload = { time: now, size: loaded }
      }

      const { success } = await uploadFile(parentPath, nestedFile, { onUploadProgress })

      if (success) {
        document.querySelector(`[data-entry-name="${nestedFile.name}"]`)
          ?.setAttribute('style', 'opacity:1;')
        const list = [...allTaskList]
        const task = list.find(t => t.nestedFile.nestedPath === nestedFile.nestedPath)!
        const taskIndex = list.findIndex(t => t.nestedFile.nestedPath === nestedFile.nestedPath)
        list.splice(taskIndex, 1, { ...task, status: 'success' })
        allTaskList = list
        setUploadTaskList(list)
      }
      successList.push(success)
    }
    if (successList.every(Boolean)) {
      handleRefresh()
      toast.success('上传成功')
    }
    ;(uploadInputRef.current as any).value = ''
  }, [uploadTaskList, setUploadTaskList, currentPath, uploadFile, handleRefresh])

  const handleCancelSelect = useCallback((e: any) => {
    if (e.button === 2) return  // oncontextmenu
    if (  // avoid multiple select and rename
      e.metaKey || e.ctrlKey || e.shiftKey ||
      document.getElementById('file-explorer-name-input')
    ) return
    setSelectedEntryList([])
  }, [])

  const handleNameSuccess = useCallback((entry: IEntry) => {
    setNewDirMode(false)
    setNewTxtMode(false)
    setRenameMode(false)
    handleRefresh()
    setSelectedEntryList([entry])
    setScrollWaiter({ wait: true, smooth: true })
  }, [handleRefresh])

  const handleNameFail = useCallback((failType: NameFailType) => {
    if (['escape', 'empty', 'no_change'].includes(failType)) {
      setNewDirMode(false)
      setNewTxtMode(false)
      setRenameMode(false)
    }
  }, [])

  const handleUploadClick = useCallback(() => {
    (uploadInputRef.current as any)?.click()
  }, [])

  const handleDownloadClick = useCallback((contextEntryList?: IEntry[]) => {
    const processList = contextEntryList || selectedEntryList
    const { msg, downloadName, cmd } = getDownloadInfo(currentPath, processList)
    const close = () => setDownloadConfirmorProps({ isOpen: false })
    const icon = <SvgIcon.Download size={36} />

    setDownloadConfirmorProps({
      isOpen: true,
      content: (
        <div className="p-4 text-center">
          <div className="p-4 flex justify-center">
            {icon}
          </div>
          <p className="mt-2 text-base break-all">{msg} ？</p>
        </div>
      ),
      onCancel: close,
      onConfirm: () => {
        close()
        FsApi.startDownload(currentPath, downloadName, cmd)
      },
    })
  }, [currentPath, selectedEntryList])

  const handleDeleteClick = useCallback(async (contextEntryList?: IEntry[]) => {
    const processList = contextEntryList || selectedEntryList
    const len = processList.length
    if (!len) return
    const msg = len === 1 ? processList[0].name : `${len} 个项目`
    const close = () => setDeleteConfirmorProps({ isOpen: false })
    const icon = <SvgIcon.Delete size={36} />

    setDeleteConfirmorProps({
      isOpen: true,
      content: (
        <div className="p-4 text-center">
          <div className="p-4 flex justify-center">
            {icon}
          </div>
          <p className="mt-2 text-base break-all">删除 <span className="font-bold">{msg}</span> ？</p>
        </div>
      ),
      onCancel: close,
      onConfirm: async () => {
        close()
        const successList: boolean[] = []
        for (const entry of processList) {
          const { name } = entry
          const { success } = await deleteEntry(`${currentPath}/${name}`)
          document.querySelector(`.gg-entry-node[data-entry-name="${name}"]`)?.setAttribute('style', 'opacity:0;')
          successList.push(success)
        }
        if (successList.every(Boolean)) {
          handleRefresh()
        }
      },
    })
  }, [deleteEntry, currentPath, selectedEntryList, handleRefresh])

  useEffect(() => setWindowLoading(fetching), [setWindowLoading, fetching])

  useEffect(() => {
    if (!currentPath && rootEntryList.length) {
      handleRootEntryClick(rootEntryList[0])
    }
  }, [currentPath, rootEntryList, handleRootEntryClick])

  useEffect(() => {
    const container: any = containerRef.current
    if (container && scrollWaiter.wait && !fetching) {
      const target: any = document.querySelector('.gg-entry-node[data-selected="true"]')
      const top = target ? target.offsetTop - 10 : 0
      container!.scrollTo({ top, behavior: scrollWaiter.smooth ? 'smooth' : undefined })
      setScrollWaiter({ wait: false })
      setPrevDirPath('')
    }
  }, [scrollWaiter, fetching])

  useEffect(() => {
    setRenameMode(false)
    setSelectedEntryList([])
    setFilterMode(false)
    setFilterText('')
    setCurrentPage(1)
  }, [currentPath])

  useEffect(() => {
    const prevEntry = entryList.find(({ name, parentPath }) => `${parentPath}/${name}` === prevDirPath)
    if (prevEntry) {
      setSelectedEntryList([prevEntry])
      setScrollWaiter({ wait: true })
    }
  }, [entryList, prevDirPath])

  useEffect(() => {
    setSelectedEntryList([])
    setCurrentPage(1)
  }, [filterText])

  const updateDirSize = useCallback(async (entry: IEntry) => {
    const { name, parentPath } = entry
    const path = `${parentPath}/${name}`
    const { success, size } = await getDirectorySize(path)
    success && setSizeMap({ ...sizeMap, [path]: size })
  }, [getDirectorySize, sizeMap, setSizeMap])

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
    const entryElements = document.querySelectorAll('.gg-entry-node')
    const pageOffset = (currentPage - 1) * MAX_PAGE_SIZE
    if (!entryElements.length) return
    const indexList: number[] = []
    entryElements.forEach((el: any, elIndex) => {
      const isContained = getIsContained({
        ...info,
        ...pick(el, 'offsetTop', 'offsetLeft', 'offsetWidth', 'offsetHeight'),
      })
      isContained && indexList.push(elIndex + pageOffset)
    })
    const names = entryList.filter((n, nIndex) => indexList.includes(nIndex))
    setSelectedEntryList(names)
  }, [currentPage, setSelectedEntryList, entryList])

  useDragSelect({
    rectRef,
    containerRef,
    containerInnerRef,
    onDragging: handleRectSelect,
  })

  useDragOperations({
    containerInnerRef,
    onEnterContainer: () => {
      setWaitDropToCurrentPath(true)
    },
    onLeaveContainer: () => {
      setWaitDropToCurrentPath(false)
    },
    onUpload: (nestedFileList, destDir) => {
      setWaitDropToCurrentPath(false)
      handleUploadStart(nestedFileList, destDir)
    },
  })

  useShortcuts({
    type: 'keyup',
    // bindCondition: isTopWindow && !newDirMode && !newTxtMode && !renameMode && !filterMode && !ContextMenu.isOpen(),
    bindCondition: isTopWindow && !newDirMode && !newTxtMode && !renameMode && !filterMode,
    shortcutMap: {
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
      'Shift+ArrowUp': disabledMap.backToTop ? null : handleBackToTop,
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
    let contextEntryList: IEntry[] = [...selectedEntryList]

    const unconfirmedLen = contextEntryList.length
    const targetEntry = event.target.closest('.gg-entry-node')

    if (targetEntry) {
      isOnBlank = false

      const isDir = targetEntry.getAttribute('data-is-directory') === 'true'
      const entryName = targetEntry.getAttribute('data-entry-name')
      const entry = entryList.find(o => o.name === entryName)

      if (isDir) isOnDir = true
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
        label: '新建文件夹',
        isShow: isOnBlank,
        onClick: () => setNewDirMode(true),
      },
      {
        icon: <SvgIcon.FileAdd />,
        label: '新建文本文件',
        isShow: isOnBlank,
        onClick: () => setNewTxtMode(true),
      },
      {
        icon: <SvgIcon.Refresh />,
        label: '刷新',
        isShow: isOnBlank,
        onClick: handleRefresh,
      },
      {
        icon: <SvgIcon.Edit />,
        label: '重命名',
        isShow: isSingleConfirmed,
        onClick: () => setTimeout(handleRename, 0),
      },
      {
        icon: <SvgIcon.Apps />,
        label: '打开方式',
        isShow: !isOnDir && isSingleConfirmed,
        onClick: () => { },
        children: CALLABLE_APP_LIST.map(app => ({
          icon: <div className="gg-app-icon w-4 h-4" data-app-id={app.id} />,
          label: app.title,
          onClick: () => handleOpenEntry(app),
        })).concat({
          icon: <div className="gg-app-icon w-4 h-4" data-app-id="iina" />,
          label: 'IINA',
          onClick: () => openInIINA(contextEntryList[0]),
        }),
      },
      {
        icon: <SvgIcon.FolderInfo />,
        label: '文件夹大小',
        isShow: isOnDir,
        onClick: () => updateDirSize(contextEntryList[0]),
      },
      {
        icon: <SvgIcon.Upload />,
        label: '上传',
        isShow: isOnBlank,
        onClick: handleUploadClick,
      },
      {
        icon: <SvgIcon.Download />,
        label: '下载',
        isShow: true,
        onClick: () => handleDownloadClick(contextEntryList),
      },
      {
        icon: <SvgIcon.Delete />,
        label: '删除',
        isShow: !isOnBlank,
        onClick: () => handleDeleteClick(contextEntryList),
      },
    ]

    setContextMenuData({ contextMenuEvent: event, menuItemList })
  }, [
    entryList,
    selectedEntryList,
    updateDirSize,
    setContextMenuData,
    setOpenOperation,
    handleRefresh,
    handleRename,
    handleUploadClick,
    handleDownloadClick,
    handleDeleteClick,
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
            {...{ disabledMap, gridMode, filterMode, filterText, hiddenShow }}
            {...{ setGridMode, setFilterMode, setFilterText, setHiddenShow }}
            onNavBack={handleNavBack}
            onNavForward={handleNavForward}
            onRefresh={handleRefresh}
            onAbort={() => abortController?.abort()}
            onBackToTop={handleBackToTop}
            onNewDir={() => handleCreate('dir')}
            onNewTxt={() => handleCreate('txt')}
            onRename={handleRename}
            onUpload={handleUploadClick}
            onDownload={handleDownloadClick}
            onDelete={handleDeleteClick}
            onSelectAll={handleSelectAll}
          />
          <div
            title={sideCollapse ? '展开' : '收起'}
            className={line(`
              absolute z-10 top-1/2 left-0 w-2 h-12 bg-gray-200 rounded-r-sm
              opacity-40 hover:bg-gray-300
              transition-all duration-200 transform -translate-y-1/2 cursor-pointer
              flex justify-center items-center
            `)}
            onClick={() => setSideCollapse(!sideCollapse)}
          >
            <span className={sideCollapse ? '' : 'transform -rotate-180'}>
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
              className="hidden absolute z-10 border box-content border-gray-400 bg-black-100 pointer-events-none"
            />
            {/* empty tip */}
            {(!fetching && isEntryListEmpty) && (
              <div className="absolute inset-0 p-10 flex justify-center items-center text-gray-200 text-lg">
                空空如也
              </div>
            )}
            <div
              ref={containerInnerRef}
              className={line(`
                relative min-h-full flex flex-wrap content-start
                ${gridMode ? 'p-2' : 'p-4'}
                ${showPagination ? 'pb-16' : ''}
              `)}
              onContextMenu={handleContextMenu}
            >
              {uploading && (
                <div className="absolute right-0 top-0 m-1 flex items-center">
                  <span className="font-din text-xs text-gray-500">{uploadInfo.speed}</span>
                  &nbsp;
                  {uploadInfo.ratio}
                </div>
              )}
              {/* create */}
              {(newDirMode || newTxtMode) && (
                <div
                  className={line(`
                    relative overflow-hidden rounded-sm
                    ${gridMode ? 'm-1 px-1 py-2 w-28' : 'mb-1 px-2 py-0 w-full flex items-center'}
                  `)}
                >
                  <EntryIcon
                    isSmall={!gridMode}
                    entry={{
                      name: 'temp-entry',
                      type: newDirMode ? EntryType.directory : EntryType.file,
                      lastModified: 0,
                      hidden: false,
                      hasChildren: false,
                      parentPath: currentPath,
                      extension: newDirMode ? '_dir_new' : '_txt_new',
                    }}
                  />
                  <NameLine
                    showInput
                    create={newDirMode ? 'dir' : 'txt'}
                    gridMode={gridMode}
                    currentPath={currentPath}
                    onSuccess={handleNameSuccess}
                    onFail={handleNameFail}
                  />
                </div>
              )}
              {/* entry list */}
              {displayEntryList.map(entry => {
                const { name, type, hidden, size, lastModified } = entry
                const isSelected = !!selectedEntryList.find(o => isSameEntry(o, entry))
                const isSmall = !gridMode
                const bytes = size === undefined ? sizeMap[`${currentPath}/${name}`] : size
                const sizeLabel = bytes === undefined ? '--' : getReadableSize(bytes)
                const dateLabel = lastModified ? DateTime.fromMillis(lastModified).toFormat('yyyy-MM-dd HH:mm') : ''
                return (
                  <div
                    key={encodeURIComponent(name)}
                    data-entry-name={name}
                    data-is-directory={type === EntryType.directory}
                    data-selected={isSelected}
                    // draggable
                    className={line(`
                      gg-entry-node
                      relative overflow-hidden rounded-sm
                      ${gridMode ? 'm-1 px-1 py-2 w-28' : 'mb-1 px-2 py-0 w-full flex items-center'}
                      ${!gridMode && isSelected ? 'bg-blue-600' : 'hover:bg-gray-100'}
                      ${isSelected ? 'bg-gray-100' : ''}
                      ${(isSelected && deleting) ? 'bg-loading' : ''}
                      ${hidden ? 'opacity-50' : 'opacity-100'}
                    `)}
                    onClick={e => handleEntryClick(e, entry)}
                    onDoubleClick={() => handleEntryDoubleClick(entry)}
                  >
                    <EntryIcon {...{ isSmall, entry, scrollHook }} />
                    <NameLine
                      showInput={renameMode && isSelected}
                      entry={entry}
                      isSelected={isSelected}
                      gridMode={gridMode}
                      currentPath={currentPath}
                      onSuccess={handleNameSuccess}
                      onFail={handleNameFail}
                    />
                    <div
                      className={line(`
                        text-xs whitespace-nowrap font-din
                        ${isSelected && !gridMode ? 'text-white' : 'text-gray-400'}
                        ${gridMode ? 'hidden' : 'w-36 pl-2 text-right'}
                      `)}
                    >
                      {dateLabel}
                    </div>
                    <div
                      className={line(`
                        text-xs whitespace-nowrap font-din min-w-16
                        ${isSelected && !gridMode ? 'text-white' : 'text-gray-400'}
                        ${gridMode ? 'w-full text-center' : 'pl-2 w-24 text-right'}
                        ${(isSelected && getting) ? 'bg-loading' : ''}
                      `)}
                    >
                      {sizeLabel}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <PathLink
            {...{ folderCount, fileCount, currentPath, rootEntry: activeRootEntry, selectedEntryList }}
            loading={fetching}
            onDirClick={handleGoFullPath}
            onRootEntryClick={handleRootEntryClick}
          />
          {showPagination && (
            <div className="absolute z-10 bottom-0 left-1/2 mb-8 transform -translate-x-1/2 scale-75">
              <Pagination
                count={entryListLen}
                pageSize={MAX_PAGE_SIZE}
                current={currentPage}
                onChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      <input
        multiple
        ref={uploadInputRef}
        type="file"
        className="hidden"
        onChange={(e: any) => handleUploadStart([...e.target.files])}
      />

      <Confirmor {...downloadConfirmorProps} />
      <Confirmor {...deleteConfirmorProps} />
      
    </>
  )
}
