import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import Icon from './Icon'
import useFetch from '../../hooks/useFetch'
import { getReadableSize, getDownloadInfo, getIsContained, isSameEntry, entrySorter, line, getMatchAppId } from '../../utils'
import { FsApi } from '../../api'
import { openedEntryListState, rootInfoState, sizeMapState, uploadTaskListState } from '../../utils/state'
import { AppComponentProps, EntryType, IEntry, IHistory, IRectInfo, INestedFile, IUploadTask } from '../../utils/types'
import PathLink from './PathLink'
import ToolBar, { IToolBarDisabledMap } from './ToolBar'
import NameLine, { NameFailType } from './NameLine'
import { DateTime } from 'luxon'
import { toast } from 'react-toastify'
import Confirmor, { ConfirmorProps } from '../../components/Confirmor'
import VirtualEntries from './VirtualEntries'
import Side from './Side'
import useDragSelect from '../../hooks/useDragSelect'
import useDragOperations from '../../hooks/useDragOperations'
import useShortcuts from '../../hooks/useShortcuts'
import { pick, throttle } from 'lodash'
import Menus from './Menus'
import Pagination from '../../components/base/Pagination'
import RemixIcon from '../../img/remixicon'

const MAX_PAGE_SIZE = 200

export default function FileExplorer(props: AppComponentProps) {

  const { isTopWindow, setWindowTitle, setWindowLoading } = props

  const [rootInfo] = useRecoilState(rootInfoState)
  const [sizeMap, setSizeMap] = useRecoilState(sizeMapState)
  const [, setOpenedEntryList] = useRecoilState(openedEntryListState)
  const [uploadTaskList, setUploadTaskList] = useRecoilState(uploadTaskListState)
  const [sideCollapse, setSideCollapse] = useState(false)
  const [currentDirPath, setCurrentPath] = useState('')
  const [prevDirPath, setPrevDirPath] = useState('')
  const [activeRootEntryMounted, setActiveRootEntryMounted] = useState('')
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
  const [virtualEntries, setVirtualEntries] = useState<File[]>([])
  const [hiddenShow, setHiddenShow] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [uploadInfo, setUploadInfo] = useState({ ratio: 0, speed: '' })
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [shownMenus, setShownMenus] = useState<any>(null)

  const rectRef = useRef(null)
  const containerRef = useRef(null)       // containerInnerRef 的容器，y-scroll-auto
  const containerInnerRef = useRef(null)  // entryList 容器，最小高度与 containerRef 的一致，自动撑高
  const uploadInputRef = useRef(null)

  const { fetch: getEntryList, loading: fetching, data, setData } = useFetch(FsApi.getEntryList)
  const { fetch: deleteEntry, loading: deleting } = useFetch(FsApi.deleteEntry)
  const { fetch: uploadFile, loading: uploading } = useFetch(FsApi.uploadFile)
  const { fetch: getDirectorySize, loading: getting } = useFetch(FsApi.getDirectorySize)

  const { rootEntryList, rootEntryMountedList } = useMemo(() => {
    const { rootEntryList } = rootInfo
    const rootEntryMountedList = rootEntryList.map(v => v.mounted)
    return { rootEntryList, rootEntryMountedList }
  }, [rootInfo])

  const isInRoot = useMemo(() => rootEntryMountedList.includes(currentDirPath), [rootEntryMountedList, currentDirPath])

  useEffect(() => {
    const title = isInRoot
      ? currentDirPath
      : currentDirPath.split('/').pop() as string
    setWindowTitle(title)
  }, [currentDirPath, setWindowTitle, isInRoot])

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

  const { entryList, entryListLen, isEntryListEmpty, dirCount, fileCount } = useMemo(() => {
    const list: IEntry[] = data ? data.entryList.sort(entrySorter) : []
    const entryList = list
      .filter(o => o.name.toLowerCase().includes(filterText.toLowerCase()))
      .filter(o => hiddenShow ? true : !o.hidden)
    let dirCount = 0
    let fileCount = 0
    entryList.forEach(({ type }) => type === EntryType.directory ? dirCount++ : fileCount++)
    const entryListLen = entryList.length
    const isEntryListEmpty = entryListLen === 0
    return { entryList, entryListLen, isEntryListEmpty, dirCount, fileCount }
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
      refresh: fetching || !currentDirPath,
      backToTop: !currentDirPath || isInRoot,
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
  }, [history, fetching, currentDirPath, isInRoot, newDirMode, newTxtMode, selectedEntryList, isEntryListEmpty])

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
    updateRootEntryMounted?: boolean
  }) => {
    abortController && abortController.abort()
    const { path, direction, pushPath, updateRootEntryMounted } = props
    setPrevDirPath(currentDirPath)
    setCurrentPath(path)
    fetchPathData(path)
    updateHistory(direction, pushPath ? path : undefined)
    if (updateRootEntryMounted) {
      const mounted = rootEntryMountedList
        .filter(m => path.startsWith(m))
        .sort((a, b) => a.length > b.length ? -1 : 1)
        .at(0)!
      setActiveRootEntryMounted(mounted)
    }
  }, [abortController, currentDirPath, fetchPathData, rootEntryMountedList, updateHistory])

  const handleRootEntryClick = useCallback((path: string) => {
    handlePathChange({ path, direction: 'forward', pushPath: true, updateRootEntryMounted: true })
  }, [handlePathChange])

  const handleDirOpen = useCallback((dirName: string) => {
    const path = `${currentDirPath}/${dirName}`
    handlePathChange({ path, direction: 'forward', pushPath: true })
  }, [handlePathChange, currentDirPath])

  const handleGoFullPath = useCallback((path: string) => {
    handlePathChange({ path, direction: 'forward', pushPath: true })
  }, [handlePathChange])

  const handleNavBack = useCallback(() => {
    const { position, list } = history
    const path = list[position - 1]
    handlePathChange({ path, direction: 'back', updateRootEntryMounted: true })
  }, [history, handlePathChange])

  const handleNavForward = useCallback(() => {
    const { position, list } = history
    const path = list[position + 1]
    handlePathChange({ path, direction: 'forward', updateRootEntryMounted: true })
  }, [history, handlePathChange])

  const handleRefresh = useCallback(() => {
    setSelectedEntryList([])
    fetchPathData(currentDirPath, true)
  }, [fetchPathData, currentDirPath])

  const handleBackToTop = useCallback(() => {
    const list = currentDirPath.split('/')
    list.pop()
    const path = list.join('/')
    handlePathChange({ path, direction: 'forward', pushPath: true })
  }, [currentDirPath, handlePathChange])

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
    // 只显示当前文件夹下的
    if (!destDir) {
      setVirtualEntries(nestedFileList.filter(f => '/' + f.name === f.nestedPath).map(f => f))
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
      const parentPath = `${currentDirPath}${destDir ? `/${destDir}` : ''}`
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
        document.querySelector(`[data-name="${nestedFile.name}"]`)
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
      setVirtualEntries([])
    }
    ;(uploadInputRef.current as any).value = ''
  }, [uploadTaskList, setUploadTaskList, currentDirPath, uploadFile, handleRefresh])

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
    const { msg, downloadName, cmd } = getDownloadInfo(currentDirPath, processList)
    const close = () => setDownloadConfirmorProps({ isOpen: false })
    const icon = <RemixIcon.Download size={36} />

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
        FsApi.startDownload(currentDirPath, downloadName, cmd)
      },
    })
  }, [currentDirPath, selectedEntryList])

  const handleDeleteClick = useCallback(async (contextEntryList?: IEntry[]) => {
    const processList = contextEntryList || selectedEntryList
    const len = processList.length
    if (!len) return
    const msg = len === 1 ? processList[0].name : `${len} 个项目`
    const close = () => setDeleteConfirmorProps({ isOpen: false })
    const icon = <RemixIcon.Delete size={36} />

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
          const { success } = await deleteEntry(`${currentDirPath}/${name}`)
          document.querySelector(`.entry-node[data-name="${name}"]`)?.setAttribute('style', 'opacity:0;')
          successList.push(success)
        }
        if (successList.every(Boolean)) {
          handleRefresh()
        }
      },
    })
  }, [deleteEntry, currentDirPath, selectedEntryList, handleRefresh])

  useEffect(() => setWindowLoading(fetching), [setWindowLoading, fetching])

  useEffect(() => {
    if (!currentDirPath && rootEntryList.length) {
      handleRootEntryClick(rootEntryList[0].mounted)
    }
  }, [currentDirPath, rootEntryList, handleRootEntryClick])

  useEffect(() => {
    const container: any = containerRef.current
    if (container && scrollWaiter.wait && !fetching) {
      const target: any = document.querySelector('.entry-node[data-selected="true"]')
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
  }, [currentDirPath])

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
    const isDirectory = type === EntryType.directory
    if (isDirectory) {
      handleDirOpen(name)
    } else {
      const appId = getMatchAppId(entry)
      if (appId) {
        setOpenedEntryList([{ ...entry, parentPath: currentDirPath, openAppId: appId, isOpen: false }])
      } else {
        handleDownloadClick()
      }
    }
  }, [renameMode, currentDirPath, handleDirOpen, handleDownloadClick, setOpenedEntryList])

  const handleSelectAll = useCallback((force?: boolean) => {
    const isSelectAll = force || !selectedEntryList.length
    setSelectedEntryList(isSelectAll ? entryList : [])
  }, [setSelectedEntryList, entryList, selectedEntryList])

  const handleRectSelect = useCallback((info: IRectInfo) => {
    const entryElements = document.querySelectorAll('.entry-node')
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
        ? () => handleDirOpen(selectedEntryList[0].name)
        : null,
    },
  })

  const handleContextMenu = useCallback((event: any) => {
    event.preventDefault()
    event.stopPropagation()
    const { target, clientX: left, clientY: top } = event
    const onClose = () => setShownMenus(null)
    const menuProps = {
      top, left,
      target, currentDirPath, entryList, selectedEntryList,
      setOpenedEntryList, updateDirSize,
      setNewDirMode, setNewTxtMode, setSelectedEntryList,
      handleRefresh, handleRename, handleUploadClick, handleDownloadClick, handleDeleteClick,
      onClose,
    }
    setShownMenus(<Menus {...menuProps} />)
  }, [
    currentDirPath, entryList, selectedEntryList,
    setOpenedEntryList, updateDirSize,
    handleRefresh, handleRename, handleUploadClick, handleDownloadClick, handleDeleteClick,
  ])

  const showPagination = entryListLen > MAX_PAGE_SIZE

  return (
    <>
      {shownMenus}
      <div className="absolute inset-0 flex">
        {/* side */}
        <Side
          {...{ sideCollapse, currentDirPath, activeRootEntryMounted, rootEntryList }}
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
              absolute z-10 top-1/2 left-0 w-3 h-12 bg-gray-200 rounded-r-lg
              opacity-40 hover:bg-gray-300
              transition-all duration-200 transform -translate-y-1/2 cursor-pointer
              flex justify-center items-center
            `)}
            onClick={() => setSideCollapse(!sideCollapse)}
          >
            <span className={sideCollapse ? '' : 'transform -rotate-180'}>
              <RemixIcon.ChevronRight />
            </span>
          </div>
          <div
            ref={containerRef}
            data-drag-hover={waitDropToCurrentPath}
            className="relative flex-grow overflow-x-hidden overflow-y-auto"
            onMouseDownCapture={handleCancelSelect}
          >
            <div
              ref={rectRef}
              className="hidden absolute z-10 border box-content border-gray-400 bg-black-100 pointer-events-none"
            />
            {/* empty tip */}
            {(!fetching && isEntryListEmpty) && (
              <div className="absolute inset-0 p-10 flex justify-end items-end text-gray-200">
                <RemixIcon.Plant size={32} />
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
                    overflow-hidden rounded-sm select-none
                    ${gridMode ? 'm-2 px-1 py-2 w-28' : 'mb-1 px-2 py-0 w-full flex items-center'}
                  `)}
                >
                  <Icon
                    small={!gridMode}
                    entry={{
                      name: 'virtual-entry',
                      type: newDirMode ? EntryType.directory : EntryType.file,
                      lastModified: 0,
                      hidden: false,
                      hasChildren: false,
                      parentPath: currentDirPath,
                      extension: newDirMode ? '_dir_new' : '_txt_new',
                    }}
                  />
                  <NameLine
                    showInput
                    create={newDirMode ? 'dir' : 'txt'}
                    gridMode={gridMode}
                    currentDirPath={currentDirPath}
                    onSuccess={handleNameSuccess}
                    onFail={handleNameFail}
                  />
                </div>
              )}
              {/* entryList */}
              {displayEntryList.map(entry => {
                const { name, type, hidden, size, lastModified } = entry
                const isSelected = !!selectedEntryList.find(o => isSameEntry(o, entry))
                const small = !gridMode
                const bytes = size === undefined ? sizeMap[`${currentDirPath}/${name}`] : size
                const sizeLabel = bytes === undefined ? '--' : getReadableSize(bytes)
                const dateLabel = lastModified ? DateTime.fromMillis(lastModified).toFormat('yyyy-MM-dd HH:mm') : ''
                return (
                  <div
                    key={encodeURIComponent(name)}
                    data-name={name}
                    data-dir={type === EntryType.directory}
                    data-selected={isSelected}
                    draggable
                    className={line(`
                      entry-node overflow-hidden rounded-sm select-none
                      ${gridMode ? 'm-2 px-1 py-2 w-28' : 'mb-1 px-2 py-0 w-full flex items-center'}
                      ${!gridMode && isSelected ? 'bg-blue-600' : 'hover:bg-gray-100'}
                      ${isSelected ? 'bg-gray-100' : ''}
                      ${(isSelected && deleting) ? 'bg-loading' : ''}
                      ${hidden ? 'opacity-50' : 'opacity-100'}
                    `)}
                    onClick={e => handleEntryClick(e, entry)}
                    onDoubleClick={() => handleEntryDoubleClick(entry)}
                  >
                    <Icon {...{ small, entry, scrollHook }} />
                    <NameLine
                      showInput={renameMode && isSelected}
                      entry={entry}
                      isSelected={isSelected}
                      gridMode={gridMode}
                      currentDirPath={currentDirPath}
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

              <VirtualEntries {...{ virtualEntries, gridMode }} />

            </div>
          </div>
          <PathLink
            {...{ dirCount, fileCount, currentDirPath, activeRootEntryMounted, selectedEntryList }}
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
