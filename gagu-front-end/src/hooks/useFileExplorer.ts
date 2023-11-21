import { useCallback, useEffect, useMemo, useState } from 'react'
import { IEntry, INestedFile, IRootEntry, IRootInfo, IUploadTransferTask, IVisitHistory, Sort, SortType, TransferTaskStatus, TransferTaskType, TunnelType } from '../types'
import { DOWNLOAD_PERIOD, getDownloadInfo, getEntryPath, path2RootEntry, sortMethodMap } from '../utils'
import { useRecoilState } from 'recoil'
import { entryPathMapState, lastChangedPathState, rootInfoState, transferSignalState, transferTaskListState } from '../states'
import { useRequest } from './useRequest'
import { DownloadApi, FsApi, TunnelApi, UserApi } from '../api'
import { useTranslation } from 'react-i18next'
import { Confirmor } from '../components/common'
import toast from 'react-hot-toast'
import { throttle } from 'lodash-es'

interface Props {
  filterText: string
  hiddenShow: boolean
  containerRef: any
}

export default function useFileExplorer(props: Props) {
  const {
    filterText,
    hiddenShow,
    containerRef,
  } = props

  const { t } = useTranslation()

  const [rootInfo, setRootInfo] = useRecoilState(rootInfoState)
  const [entryPathMap, setEntryPathMap] = useRecoilState(entryPathMapState)
  const [transferTaskList, setTransferTaskList] = useRecoilState(transferTaskListState)
  const [transferSignal, setTransferSignal] = useRecoilState(transferSignalState)
  const [lastChangedPath, setLastChangedPath] = useRecoilState(lastChangedPathState)

  const [currentPath, setCurrentPath] = useState('')
  const [lastVisitedPath, setLastVisitedPath] = useState('')
  const [activeRootEntry, setActiveRootEntry] = useState<IRootEntry | null>(null)
  const [visitHistory, setVisitHistory] = useState<IVisitHistory>({ position: -1, list: [] })
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [selectedEntryList, setSelectedEntryList] = useState<IEntry[]>([])
  const [sharingModalShow, setSharingModalShow] = useState(false)
  const [sharedEntryList, setSharedEntryList] = useState<IEntry[]>([])
  const [scrollHook, setScrollHook] = useState({ top: 0, height: 0 })

  const { request: queryEntryList, loading: querying, setData } = useRequest(FsApi.queryEntryList)
  const { request: queryDirectorySize, loading: sizeQuerying } = useRequest(FsApi.queryDirectorySize)
  const { request: deleteEntry, loading: deleting } = useRequest(FsApi.deleteEntry)
  const { request: createTunnel } = useRequest(TunnelApi.createTunnel)
  const { request: createUserFavorite } = useRequest(UserApi.createUserFavorite)
  const { request: removeUserFavorite } = useRequest(UserApi.removeUserFavorite)

  const { rootEntryList, rootEntryPathList, favoriteEntryList } = useMemo(() => {
    const { rootEntryList, favoritePathList } = rootInfo
    const rootEntryPathList = rootEntryList.map(getEntryPath)
    const favoriteEntryList = favoritePathList?.map(path2RootEntry).filter(Boolean) || []
    return { rootEntryList, rootEntryPathList, favoriteEntryList }
  }, [rootInfo])

  const isInRoot = useMemo(() => rootEntryPathList.includes(currentPath), [rootEntryPathList, currentPath])

  const { entryList, isEntryListEmpty, folderCount, fileCount, gridMode, sortType } = useMemo(() => {
    const {
      list = [],
      gridMode = true,
      sortType = Sort.default,
    } = entryPathMap[currentPath] || {}

    const allEntryList = [...list].sort(sortMethodMap[sortType])
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

    entryList.forEach(({ type }) => type === 'directory' ? folderCount++ : fileCount++)

    const entryListCount = entryList.length
    const isEntryListEmpty = entryListCount === 0

    return { entryList, entryListCount, isEntryListEmpty, folderCount, fileCount, gridMode, sortType }
  }, [currentPath, entryPathMap, filterText, hiddenShow])

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

  const handleQueryEntryList = useCallback(async (path: string, keepData?: boolean) => {
    if (!path) return
    if (!keepData) {
      setData(null)
    }
    const controller = new AbortController()
    const config = { signal: controller.signal }
    setAbortController(controller)
    const { success, data } = await queryEntryList(path, config)
    if (success) {
      const res = {
        ...(entryPathMap[path] || {}),
        list: data,
      }
      setEntryPathMap({ ...entryPathMap, [path]: res })
    }
  }, [queryEntryList, setData, entryPathMap, setEntryPathMap])

  // path callback
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

  const handleDirectoryOpen = useCallback((entry: IEntry) => {
    const path = getEntryPath(entry)
    handlePathChange({ path, direction: 'forward', pushPath: true })
  }, [handlePathChange])

  const handleGoFullPath = useCallback((path: string) => {
    handlePathChange({ path, direction: 'forward', pushPath: true })
  }, [handlePathChange])

  // nav callback
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

  const handleNavRefresh = useCallback(async () => {
    setSelectedEntryList([])
    await handleQueryEntryList(currentPath, true)
  }, [handleQueryEntryList, currentPath])

  const handleNavAbort = useCallback(() => {
    abortController?.abort()
  }, [abortController])

  const handleNavToParent = useCallback(() => {
    const list = currentPath.split('/')
    list.pop()
    const path = list.join('/')
    handlePathChange({ path, direction: 'forward', pushPath: true })
  }, [currentPath, handlePathChange])

  // entry callback
  const handleSelectAll = useCallback((force?: boolean) => {
    const isSelectAll = force || !selectedEntryList.length
    setSelectedEntryList(isSelectAll ? entryList : [])
  }, [setSelectedEntryList, entryList, selectedEntryList])

  const handleDownloadClick = useCallback((contextEntryList?: IEntry[]) => {
    const entryList = contextEntryList || selectedEntryList
    const { message, downloadName } = getDownloadInfo(currentPath, entryList, t)
    Confirmor({
      t,
      type: 'download',
      content: message,
      onConfirm: async (close) => {
        const { success, message, code } = await createTunnel({
          type: TunnelType.download,
          entryList,
          downloadName,
          leftTimes: 1,
          expiredAt: Date.now() + DOWNLOAD_PERIOD,
        })
        if (success && code) {
          DownloadApi.download(code)
        } else {
          toast.error(message)
        }
        close()
      },
    })
  }, [currentPath, selectedEntryList, createTunnel, t])

  const handleShareClick = useCallback((entryList: IEntry[]) => {
    setSharedEntryList(entryList)
    setSharingModalShow(true)
  }, [])

  const handleDirectorySizeUpdate = useCallback(async (entry: IEntry) => {
    const path = getEntryPath(entry)
    const { success, data } = await queryDirectorySize(path)
    if (success) {
      const res = {
        ...(entryPathMap[path] || {}),
        size: data,
      }
      setEntryPathMap({ ...entryPathMap, [path]: res })
    }
  }, [queryDirectorySize, entryPathMap, setEntryPathMap])

  const handleFavorite = useCallback((entry: IEntry, isFavorited: boolean) => {
    Confirmor({
      t,
      type: isFavorited ? 'unfavorite' : 'favorite',
      content: t(isFavorited ? 'tip.unfavoriteItem' : 'tip.favoriteItem', { name: entry.name }),
      onConfirm: async (close) => {
        const path = getEntryPath(entry)
        const fn = isFavorited ? removeUserFavorite : createUserFavorite
        const { success, list } = await fn(path)
        if (success) {
          setRootInfo({ ...rootInfo, favoritePathList: list } as IRootInfo)
        }
        close()
      },
    })
  }, [createUserFavorite, removeUserFavorite, t, rootInfo, setRootInfo])

  const handleDeleteClick = useCallback(async (contextEntryList?: IEntry[]) => {
    const processList = contextEntryList || selectedEntryList
    const count = processList.length
    if (!count) return
    const message = count === 1
      ? t('tip.deleteItem', { name: processList[0].name })
      : t('tip.deleteItems', { count })

    Confirmor({
      t,
      type: 'delete',
      content: message,
      onConfirm: async (close) => {
        for (const entry of processList) {
          const { name } = entry
          const path = getEntryPath(entry)
          const { success } = await deleteEntry(path)
          if (success) {
            document.querySelector(`.gagu-entry-node[data-entry-name="${name}"]`)?.setAttribute('style', 'opacity:0;')
            const { favoritePathList } = rootInfo
            setRootInfo({ ...rootInfo, favoritePathList: favoritePathList.filter((p) => p !== path) } as IRootInfo)
          }
        }
        handleNavRefresh()
        close()
      },
    })
  }, [deleteEntry, selectedEntryList, handleNavRefresh, t, setRootInfo, rootInfo])

  const handleGridModeChange = useCallback((mode: boolean) => {
    const res = {
      ...(entryPathMap[currentPath] || {}),
      gridMode: mode,
    }
    setEntryPathMap({ ...entryPathMap, [currentPath]: res })
  }, [currentPath, entryPathMap, setEntryPathMap])

  const handleSortChange = useCallback((sortType: SortType) => {
    const res = {
      ...(entryPathMap[currentPath] || {}),
      sortType: sortType,
    }
    setEntryPathMap({ ...entryPathMap, [currentPath]: res })
  }, [currentPath, entryPathMap, setEntryPathMap])

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
  }, [containerRef])

  useEffect(() => {
    if (lastChangedPath.path === currentPath) {
      handleNavRefresh()
      setLastChangedPath({ path: '', timestamp: 0 })
    }
  }, [lastChangedPath, currentPath, handleNavRefresh, setLastChangedPath])

  useEffect(() => {
    setSelectedEntryList([])
  }, [filterText, setSelectedEntryList])

  useEffect(() => {
    if (!currentPath && rootEntryList.length) {
      handleRootEntryClick(rootEntryList[0])
    }
  }, [currentPath, rootEntryList, handleRootEntryClick])

  return {
    rootInfo, entryPathMap, currentPath, activeRootEntry, lastVisitedPath, setLastVisitedPath,
    querying, sizeQuerying, deleting,
    rootEntryList, rootEntryPathList, favoriteEntryList, isInRoot,
    entryList, selectedEntryList, isEntryListEmpty, folderCount, fileCount, gridMode, sortType,
    visitHistory, setSelectedEntryList,
    handleRootEntryClick, handleDirectoryOpen, handleGoFullPath,
    handleNavBack, handleNavForward, handleNavRefresh, handleNavAbort, handleNavToParent,
    sharingModalShow, setSharingModalShow, sharedEntryList, 
    handleSelectAll, handleDownloadClick, handleShareClick, handleDirectorySizeUpdate, handleFavorite, handleDeleteClick,
    scrollHook,
    handleGridModeChange, handleSortChange,
    addUploadTransferTask,
  }
}
