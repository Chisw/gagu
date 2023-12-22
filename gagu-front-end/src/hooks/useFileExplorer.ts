import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  EditModeType,
  EntryType,
  IEntry,
  IEntryPathCache,
  IRootEntry,
  IScrollerWatcher,
  ISideEntry,
  IVisitHistory,
  Sort,
  SortType,
  TunnelType,
} from '../types'
import {
  EntryPathCacheStore,
  UserConfigStore,
  WINDOW_DURATION,
  getDownloadInfo,
  getEntryPath,
  getParentPath,
  getIsSameEntry,
  safeQuotes,
  sortMethodMap,
} from '../utils'
import { useRecoilState } from 'recoil'
import {
  entryPathCacheState,
  lastChangedDirectoryState,
  baseDataState,
} from '../states'
import { useRequest } from './useRequest'
import { DownloadApi, FsApi, TunnelApi } from '../api'
import { useTranslation } from 'react-i18next'
import { Confirmor } from '../components/common'
import toast from 'react-hot-toast'
import { omit, throttle } from 'lodash-es'
import { useTouchMode } from './useTouchMode'
import { useAddUploadingTask } from './useAddUploadingTask'
import { useUserConfig } from './useUserConfig'

const RefreshTimerCache: {
  [PATH: string]: {
    timer: NodeJS.Timeout,
    timestamp: number,
  }
} = {}

export interface IFileExplorerDisabledMap {
  navBack: boolean
  navForward: boolean
  navRefresh: boolean
  navToParent: boolean
  createFolder: boolean
  createText: boolean
  rename: boolean
  upload: boolean
  download: boolean
  delete: boolean
  selectAll: boolean
  filter: boolean
  gridView: boolean
  listView: boolean
  openFolder: boolean
}

interface Props {
  containerRef: any
  specifiedPath?: string
  isUserDesktop?: boolean
}

export function useFileExplorer(props: Props) {
  const {
    containerRef,
    specifiedPath = '',
    isUserDesktop = false,
  } = props

  const { t } = useTranslation()

  const [baseData, setBaseData] = useRecoilState(baseDataState)
  const [entryPathCache, setEntryPathCache] = useRecoilState(entryPathCacheState)
  const [lastChangedDirectory, setLastChangedDirectory] = useRecoilState(lastChangedDirectoryState)

  const touchMode = useTouchMode()
  const { userConfig: { kiloSize } } = useUserConfig()

  const [currentPath, setCurrentPath] = useState('')
  const [lastVisitedPath, setLastVisitedPath] = useState('')
  const [activeRootEntry, setActiveRootEntry] = useState<IRootEntry | null>(null)
  const [visitHistory, setVisitHistory] = useState<IVisitHistory>({ position: -1, list: [] })
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [selectedEntryList, setSelectedEntryList] = useState<IEntry[]>([])
  const [sharingModalShow, setSharingModalShow] = useState(false)
  const [editMode, setEditMode] = useState<EditModeType | null>(null)
  const [filterMode, setFilterMode] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [sharingEntryList, setSharingEntryList] = useState<IEntry[]>([])
  const [thumbScrollWatcher, setThumbScrollWatcher] = useState<IScrollerWatcher>({ top: 0, height: 0 })

  const { request: queryEntryList, loading: querying } = useRequest(FsApi.queryEntryList)
  const { request: queryDirectorySize, loading: sizeQuerying } = useRequest(FsApi.queryDirectorySize)
  const { request: deleteEntry, loading: deleting } = useRequest(FsApi.deleteEntry)
  const { request: createTunnel } = useRequest(TunnelApi.createTunnel)
  const { request: createFavorite } = useRequest(FsApi.createFavorite)
  const { request: removeFavorite } = useRequest(FsApi.removeFavorite)

  const { handleUploadTaskAdd } = useAddUploadingTask()

  const { rootEntryList, rootEntryPathList, favoriteEntryList, sideEntryList, supportThumbnail } = useMemo(() => {
    const { rootEntryList, favoriteEntryList, serverOS } = baseData
    const { supportThumbnail } = serverOS
    const rootEntryPathList = rootEntryList.map(getEntryPath)
    const sideEntryList: ISideEntry[] = [...rootEntryList, ...favoriteEntryList]
    return { rootEntryList, rootEntryPathList, favoriteEntryList, sideEntryList, supportThumbnail }
  }, [baseData])

  const isInRoot = useMemo(() => rootEntryPathList.includes(currentPath), [rootEntryPathList, currentPath])

  const { entryList, isEntryListEmpty, folderCount, fileCount, hiddenShow, gridMode, sortType } = useMemo(() => {
    const {
      list = [],
      hiddenShow = false,
      gridMode = !touchMode,
      sortType = Sort.default,
    } = entryPathCache[currentPath] || {}

    const allEntryList = [...list].sort(sortMethodMap[sortType])
    const text = filterText.toLowerCase()
    const asteriskExist = text.includes('*')
    const asteriskStart = text.startsWith('*')
    const asteriskEnd = text.endsWith('*')

    const entryList = allEntryList
      .filter(entry => hiddenShow ? true : !entry.hidden)
      .filter((entry: IEntry) => {
        if (!text) return true
        const name = entry.name.toLowerCase()
        const key = text.replaceAll('*', '')
        if (asteriskExist) {
          if (asteriskStart) {
            if (asteriskEnd) {
              return name.includes(key) && !name.startsWith(key) && !name.endsWith(key)
            } else {
              return name.endsWith(key)
            }
          } else if (asteriskEnd) {
            return name.startsWith(key)
          } else {
            const [start, end] = text.split('*')
            return name.startsWith(start) && name.endsWith(end)
          }
        } else {
          return name.startsWith(key)
        }
      })

    let folderCount = 0
    let fileCount = 0

    entryList.forEach(({ type }) => type === 'directory' ? folderCount++ : fileCount++)

    const isEntryListEmpty = entryList.length === 0

    return { entryList, isEntryListEmpty, folderCount, fileCount, hiddenShow, gridMode, sortType }
  }, [currentPath, entryPathCache, filterText, touchMode])

  const disabledMap = useMemo(() => {
    const { position, list } = visitHistory
    const selectedCount = selectedEntryList.length
    const isSingle = selectedCount === 1
    const isSingleDirectory = isSingle && selectedEntryList[0].type === EntryType.directory

    const disabledMap: IFileExplorerDisabledMap = {
      navBack: position <= 0 || isUserDesktop,
      navForward: list.length === position + 1 || isUserDesktop,
      navRefresh: querying || !currentPath,
      navToParent: !currentPath || isInRoot || isUserDesktop,
      createFolder: touchMode ? false : !!editMode,
      createText: touchMode ? false : !!editMode,
      rename: !isSingle,
      upload: false,
      download: isEntryListEmpty,
      delete: !selectedCount,
      selectAll: isEntryListEmpty,
      filter: isUserDesktop,
      gridView: isUserDesktop,
      listView: isUserDesktop,
      openFolder: !isSingleDirectory,
    }
    return disabledMap
  }, [visitHistory, querying, currentPath, isInRoot, isUserDesktop, touchMode, editMode, selectedEntryList, isEntryListEmpty])

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

  const handleQueryEntryList = useCallback(async (path: string, inheritedCache?: IEntryPathCache) => {
    if (!path) return
    const controller = new AbortController()
    const config = { signal: controller.signal }
    setAbortController(controller)
    const { success, data: list } = await queryEntryList(path, config)
    if (success) {
      const targetCache = inheritedCache || entryPathCache
      const data = {
        ...(targetCache[path] || {}),
        list,
      }
      const newEntryPathCache = { ...targetCache, [path]: data }
      setEntryPathCache(newEntryPathCache)
      return newEntryPathCache
    }
  }, [queryEntryList, entryPathCache, setEntryPathCache])

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
      const activeRootEntry = rootEntryList
        .map(entry => ({ path: getEntryPath(entry), entry }))
        .filter(o => path.startsWith(o.path))
        .sort((a, b) => a.path.length > b.path.length ? -1 : 1)[0]?.entry
      setActiveRootEntry(activeRootEntry)
    }
  }, [abortController, currentPath, handleQueryEntryList, rootEntryList, updateHistory])

  const handleDirectoryOpen = useCallback((entry: IEntry, updateActiveRootEntry?: boolean) => {
    const path = getEntryPath(entry)
    handlePathChange({ path, direction: 'forward', pushPath: true, updateActiveRootEntry })
  }, [handlePathChange])

  const handleGoFullPath = useCallback((path: string, updateActiveRootEntry?: boolean) => {
    handlePathChange({ path, direction: 'forward', pushPath: true, updateActiveRootEntry })
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

  const handleNavRefresh = useCallback(async (option?: {
    assignedPath?: string,
    refreshParent?: boolean,
    otherPaths?: string[],
  })=> {
    const { assignedPath, refreshParent, otherPaths = [] } = option || {}
    const targetPath = assignedPath || currentPath
    setSelectedEntryList([])
    let newEntryPathCache = await handleQueryEntryList(targetPath)
    const restPaths = [...otherPaths]
    if (refreshParent) {
      restPaths.push(getParentPath(targetPath))
    }
    for (const path of Array.from(new Set(restPaths))) {
      newEntryPathCache = await handleQueryEntryList(path, newEntryPathCache)
    }
  }, [handleQueryEntryList, currentPath])

  const handleNavAbort = useCallback(() => {
    abortController?.abort()
  }, [abortController])

  const handleNavToParent = useCallback(() => {
    const path = getParentPath(currentPath)
    handlePathChange({ path, direction: 'forward', pushPath: true })
  }, [currentPath, handlePathChange])

  // entry callback
  const handleSelectAll = useCallback((force?: boolean) => {
    const isSelectAll = force || (selectedEntryList.length < entryList.length)
    setSelectedEntryList(isSelectAll ? entryList : [])
  }, [setSelectedEntryList, entryList, selectedEntryList])

  const handleUploadClick = useCallback(() => {
    const input = document.createElement('input')
    input.multiple = true
    input.type = 'file'
    input.className = 'hidden'
    input.onchange = (e: any) => handleUploadTaskAdd([...e.target.files], currentPath)
    input.click()
  }, [handleUploadTaskAdd, currentPath])

  const handleDownloadClick = useCallback((contextEntryList?: IEntry[]) => {
    const entryList = contextEntryList || selectedEntryList
    const { message, downloadName } = getDownloadInfo(currentPath, entryList)
    Confirmor({
      type: 'download',
      content: message,
      onConfirm: async (close) => {
        const { success, message, data: code } = await createTunnel({
          type: TunnelType.download,
          entryList,
          downloadName,
        })
        if (success && code) {
          DownloadApi.download(code)
        } else {
          toast.error(message)
        }
        close()
      },
    })
  }, [currentPath, selectedEntryList, createTunnel])

  const handleShareClick = useCallback((entryList: IEntry[]) => {
    setSharingEntryList(entryList)
    setSharingModalShow(true)
  }, [])

  const handleDirectorySizeUpdate = useCallback(async (entry: IEntry) => {
    const path = getEntryPath(entry)
    const { success, data: size } = await queryDirectorySize(path)
    if (success) {
      const { parentPath } = entry
      const currentList = [...entryPathCache[parentPath]?.list || []]
      const index = currentList.findIndex((e) => getIsSameEntry(e, entry))!
      currentList.splice(index, 1, { ...entry, size })
      setEntryPathCache({
        ...entryPathCache,
        [parentPath]: {
          ...(entryPathCache[parentPath] || {}),
          list: currentList,
        }
      })
    }
  }, [queryDirectorySize, entryPathCache, setEntryPathCache])

  const handleFavoriteClick = useCallback((entry: IEntry, isFavorited: boolean) => {
    Confirmor({
      type: isFavorited ? 'unfavorite' : 'favorite',
      content: t(isFavorited ? 'tip.unfavoriteItem' : 'tip.favoriteItem', { name: entry.name }),
      onConfirm: async (close) => {
        const path = getEntryPath(entry)
        const fn = isFavorited ? removeFavorite : createFavorite
        const { success, data: favoriteEntryList } = await fn(path)
        if (success) {
          setBaseData({ ...baseData, favoriteEntryList })
        }
        close()
      },
    })
  }, [createFavorite, removeFavorite, t, baseData, setBaseData])

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
      onConfirm: async (close) => {
        const deletedPaths: string[] = []
        for (const entry of processList) {
          const { name } = entry
          const path = getEntryPath(entry)
          const { success } = await deleteEntry(path)
          if (success) {
            containerRef?.current?.querySelector(`.gagu-entry-node[data-entry-name="${safeQuotes(name)}"]`)
              ?.setAttribute('style', 'opacity:0;')
            deletedPaths.push(path)
          }
        }
        const { favoriteEntryList: list } = baseData
        const favoriteEntryList = list.filter((entry) => !deletedPaths.includes(getEntryPath(entry)))
        setBaseData({ ...baseData, favoriteEntryList })
        handleNavRefresh({ refreshParent: true })
        close()
      },
    })
  }, [deleteEntry, selectedEntryList, handleNavRefresh, t, setBaseData, baseData, containerRef])

  const handleHiddenShowChange = useCallback((show: boolean) => {
    const res = {
      ...(entryPathCache[currentPath] || {}),
      hiddenShow: show,
    }
    setEntryPathCache({ ...entryPathCache, [currentPath]: res })
  }, [currentPath, entryPathCache, setEntryPathCache])

  const handleGridModeChange = useCallback((mode: boolean) => {
    const res = {
      ...(entryPathCache[currentPath] || {}),
      gridMode: mode,
    }
    setEntryPathCache({ ...entryPathCache, [currentPath]: res })
  }, [currentPath, entryPathCache, setEntryPathCache])

  const handleSortChange = useCallback((sortType: SortType) => {
    const res = {
      ...(entryPathCache[currentPath] || {}),
      sortType: sortType,
    }
    setEntryPathCache({ ...entryPathCache, [currentPath]: res })
  }, [currentPath, entryPathCache, setEntryPathCache])

  useEffect(() => {
    const container: any = containerRef.current
    if (!container) return
    const listener = () => {
      const { top, height } = container.getBoundingClientRect()
      setThumbScrollWatcher({ top, height })
    }
    setTimeout(listener, WINDOW_DURATION * 4)
    const throttleListener = throttle(listener, 500)
    container.addEventListener('scroll', throttleListener)
    return () => container.removeEventListener('scroll', throttleListener)
  }, [containerRef])

  useEffect(() => {
    const { path, otherPaths = [] } = lastChangedDirectory
    const needRefresh = [path, getParentPath(path), ...otherPaths].includes(currentPath)
    if (needRefresh) {
      if (RefreshTimerCache[currentPath]) {
        const { timer, timestamp } = RefreshTimerCache[currentPath]
        clearTimeout(timer)
        if (Date.now() - timestamp > 600) {
          handleNavRefresh({ refreshParent: true, otherPaths })
          setLastChangedDirectory({ path: '', timestamp: 0 })
          return
        }
      }
      RefreshTimerCache[currentPath] = {
        timer: setTimeout(() => {
          handleNavRefresh({ assignedPath: currentPath, refreshParent: true, otherPaths })
          setLastChangedDirectory({ path: '', timestamp: 0 })
          delete RefreshTimerCache[currentPath]
        }, 200),
        timestamp: Date.now(),
      }
    }
  }, [lastChangedDirectory, currentPath, handleNavRefresh, setLastChangedDirectory])

  useEffect(() => {
    setSelectedEntryList([])
  }, [filterText, setSelectedEntryList])

  useEffect(() => {
    if (!currentPath && rootEntryList.length) {
      const { fileExplorerDefaultPath: storedPath } = UserConfigStore.get()
      if (specifiedPath || storedPath) {
        handleGoFullPath(specifiedPath || storedPath, true)
      } else {
        handleDirectoryOpen(rootEntryList[0], true)
      }
    }
  }, [specifiedPath, currentPath, rootEntryList, handleDirectoryOpen, handleGoFullPath])

  useEffect(() => {
    const cache = Object.fromEntries(Object.entries(entryPathCache)
      .map(([path, data]) => [path, omit(data, 'list')]))
    EntryPathCacheStore.set(cache)
  }, [entryPathCache])

  return {
    kiloSize,
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
    lastVisitedPath, setLastVisitedPath,
    selectedEntryList, setSelectedEntryList,
    sharingModalShow, setSharingModalShow,
    handleSelectAll, handleDirectorySizeUpdate, handleUploadTaskAdd, 
    handleDirectoryOpen, handleGoFullPath,
    handleNavBack, handleNavForward, handleNavRefresh, handleNavAbort, handleNavToParent,
    handleUploadClick, handleDownloadClick,
    handleShareClick, handleFavoriteClick, handleDeleteClick,
  }
}
