import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  EditModeType,
  IEntry,
  IEntryPathCache,
  IRootEntry,
  IScrollerWatcher,
  IVisitHistory,
  Sort,
  SortType,
  TunnelType,
  RootEntryGroup,
  IClipboardData,
  ClipboardType,
  ClipboardTypeType,
  ExistingStrategyType,
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
  clipboardDataState,
} from '../states'
import { useRequest } from './useRequest'
import { FsApi, TunnelApi } from '../api'
import { useTranslation } from 'react-i18next'
import { Confirmor, ExistingConfirmor } from '../components/common'
import toast from 'react-hot-toast'
import { throttle } from 'lodash-es'
import { useTouchMode } from './useTouchMode'
import { useAddUploadingTask } from './useAddUploadingTask'
import { useUserConfig } from './useUserConfig'
import { useMoveEntries } from './useMoveEntries'

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
  goTo: boolean
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
  copy: boolean
  cut: boolean
  paste: boolean
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
  const [clipboardData, setClipboardData] = useRecoilState(clipboardDataState)
  const [lastChangedDirectory, setLastChangedDirectory] = useRecoilState(lastChangedDirectoryState)

  const touchMode = useTouchMode()
  const {
    userConfig,
    setUserConfig,
    userConfig: {
      kiloSize,
      fileExplorerSideCollapse,
    },
  } = useUserConfig()

  const { handleMove } = useMoveEntries()

  const [currentPath, setCurrentPath] = useState('')
  const [lastVisitedPath, setLastVisitedPath] = useState('')
  const [currentRootEntry, setCurrentRootEntry] = useState<IRootEntry | null>(null)
  const [visitHistory, setVisitHistory] = useState<IVisitHistory>({ position: -1, list: [] })
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [selectedEntryList, setSelectedEntryList] = useState<IEntry[]>([])
  const [sharingModalShow, setSharingModalShow] = useState(false)
  const [sideCollapse, setSideCollapse] = useState(fileExplorerSideCollapse)
  const [editMode, setEditMode] = useState<EditModeType | null>(null)
  const [filterMode, setFilterMode] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [sharingEntryList, setSharingEntryList] = useState<IEntry[]>([])
  const [movementEntryPickerShow, setMovementEntryPickerShow] = useState(false)
  const [goToPathDialogShow, setGoToPathDialogShow] = useState(false)
  const [thumbScrollWatcher, setThumbScrollWatcher] = useState<IScrollerWatcher>({ top: 0, height: 0 })

  const { request: queryEntryList, loading: querying } = useRequest(FsApi.queryEntryList)
  const { request: queryDirectorySize, loading: sizeQuerying } = useRequest(FsApi.queryDirectorySize)
  const { request: queryExistsCount } = useRequest(FsApi.queryExistsCount)
  const { request: deleteEntry, loading: deleting } = useRequest(FsApi.deleteEntry)
  const { request: createTunnel } = useRequest(TunnelApi.createTunnel)
  const { request: createFavorite } = useRequest(FsApi.createFavorite)
  const { request: removeFavorite } = useRequest(FsApi.removeFavorite)
  const { request: moveEntry } = useRequest(FsApi.moveEntry)
  const { request: copyEntry } = useRequest(FsApi.copyEntry)

  const { handleUploadTaskAdd } = useAddUploadingTask()

  const { rootEntryList, favoriteRootEntryList, canNotBackToParentPathList, supportThumbnail } = useMemo(() => {
    const { rootEntryList, serverOS } = baseData
    const { supportThumbnail } = serverOS

    const favoriteRootEntryList = rootEntryList
      .filter(entry => entry.group === RootEntryGroup.favorite)

    const canNotBackToParentPathList = rootEntryList
      .filter(entry => entry.group !== RootEntryGroup.favorite)
      .map(getEntryPath)

    return { rootEntryList, favoriteRootEntryList, canNotBackToParentPathList, supportThumbnail }
  }, [baseData])

  const canNotBackToParent = useMemo(() => {
    return canNotBackToParentPathList.includes(currentPath)
  }, [canNotBackToParentPathList, currentPath])

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

    const disabledMap: IFileExplorerDisabledMap = {
      navBack: position <= 0 || isUserDesktop,
      navForward: list.length === position + 1 || isUserDesktop,
      navRefresh: querying || !currentPath,
      navToParent: !currentPath || canNotBackToParent || isUserDesktop,
      goTo: isUserDesktop,
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
      openFolder: !isSingle,
      copy: !selectedCount,
      cut: !selectedCount,
      paste: !clipboardData,
    }
    return disabledMap
  }, [
    visitHistory,
    querying,
    currentPath,
    canNotBackToParent,
    isUserDesktop,
    touchMode,
    editMode,
    selectedEntryList,
    isEntryListEmpty,
    clipboardData,
  ])

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

  const handlePathChange = useCallback((props: {
    path: string
    direction: 'forward' | 'backward'
    pushPath?: boolean
    updateCurrentRootEntry?: boolean
  }) => {
    abortController?.abort()

    const { path, direction, pushPath, updateCurrentRootEntry } = props

    setLastVisitedPath(currentPath)
    setCurrentPath(path)
    handleQueryEntryList(path)
    updateHistory(direction, pushPath ? path : undefined)

    if (updateCurrentRootEntry) {
      const currentRootEntry = rootEntryList
        .filter(entry => entry.group !== RootEntryGroup.favorite)
        .map(entry => ({ path: getEntryPath(entry), entry }))
        .filter(o => path.startsWith(o.path))
        .sort((a, b) => a.path.length > b.path.length ? -1 : 1)[0]?.entry

      setCurrentRootEntry(currentRootEntry)
    }
  }, [abortController, currentPath, handleQueryEntryList, rootEntryList, updateHistory])

  const handleDirectoryOpen = useCallback((entry: IEntry, updateCurrentRootEntry?: boolean) => {
    const path = getEntryPath(entry)
    handlePathChange({ path, direction: 'forward', pushPath: true, updateCurrentRootEntry })
  }, [handlePathChange])

  const handleGoFullPath = useCallback((path: string, updateCurrentRootEntry?: boolean) => {
    handlePathChange({ path, direction: 'forward', pushPath: true, updateCurrentRootEntry })
  }, [handlePathChange])

  const handleNavBack = useCallback(() => {
    const { position, list } = visitHistory
    const path = list[position - 1]
    handlePathChange({ path, direction: 'backward', updateCurrentRootEntry: true })
  }, [visitHistory, handlePathChange])

  const handleNavForward = useCallback(() => {
    const { position, list } = visitHistory
    const path = list[position + 1]
    handlePathChange({ path, direction: 'forward', updateCurrentRootEntry: true })
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
    const isPathPermitted = canNotBackToParentPathList.every(path => path !== targetPath)
    if (refreshParent && isPathPermitted) {
      restPaths.push(getParentPath(targetPath))
    }
    for (const path of Array.from(new Set(restPaths))) {
      newEntryPathCache = await handleQueryEntryList(path, newEntryPathCache)
    }
  }, [handleQueryEntryList, currentPath, canNotBackToParentPathList])

  const handleNavAbort = useCallback(() => {
    abortController?.abort()
  }, [abortController])

  const handleNavToParent = useCallback(() => {
    const path = getParentPath(currentPath)
    handlePathChange({ path, direction: 'forward', pushPath: true })
  }, [currentPath, handlePathChange])

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
          TunnelApi.download(code)
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

  const handleClipboardAdd = useCallback((data: IClipboardData) => {
    setClipboardData(data)
  }, [setClipboardData])

  const handlePasteStart = useCallback(async (type: ClipboardTypeType, entryList: IEntry[], strategy?: ExistingStrategyType) => {
    const isCopy = type === ClipboardType.copy
    const isCut = type === ClipboardType.cut

    for (const entry of entryList) {
      const fromPath = getEntryPath(entry)
      const toPath = `${currentPath}/${entry.name}`

      if (isCut && fromPath === toPath) continue

      const fn = isCopy ? copyEntry : moveEntry
      const { success } = await fn(fromPath, toPath, strategy)
      if (success) {
        setLastChangedDirectory({
          path: currentPath,
          timestamp: Date.now(),
          otherPaths: [entry.parentPath],
        })
      }
    }

    isCut && setClipboardData(null)
  }, [copyEntry, currentPath, moveEntry, setClipboardData, setLastChangedDirectory])

  const handlePasteCheck = useCallback(async (type: ClipboardTypeType, entryList: IEntry[]) => {
    const pathList = entryList.map(entry => `${currentPath}/${entry.name}`)
    const { data: count } = await queryExistsCount({ pathList })
    if (count) {
      ExistingConfirmor({
        count,
        onConfirm: (strategy) => handlePasteStart(type, entryList, strategy),
      })
    } else {
      handlePasteStart(type, entryList)
    }
  }, [currentPath, handlePasteStart, queryExistsCount])

  const handleClipboardPaste = useCallback(() => {
    if (!clipboardData) return
    const { type, entryList } = clipboardData
    Confirmor({
      type: 'paste',
      content: t('tip.pasteEntries', { count: entryList.length }),
      onConfirm: (close) => {
        close()
        handlePasteCheck(type, entryList)
      },
    })
  }, [clipboardData, handlePasteCheck, t])

  const handleFavoriteClick = useCallback((entry: IEntry) => {
    const isFavorited = !!baseData.rootEntryList
      .find(e => e.group === RootEntryGroup.favorite && getIsSameEntry(e, entry))

    Confirmor({
      type: isFavorited ? 'unfavorite' : 'favorite',
      content: t(isFavorited ? 'tip.unfavoriteItem' : 'tip.favoriteItem', { name: entry.name }),
      onConfirm: async (close) => {
        const path = getEntryPath(entry)
        const fn = isFavorited ? removeFavorite : createFavorite
        const { success, data: favoriteRootEntryList } = await fn(path)
        const rootEntryList = [
          ...baseData.rootEntryList.filter(entry => entry.group !== RootEntryGroup.favorite),
          ...favoriteRootEntryList,
        ]
        if (success) {
          setBaseData({ ...baseData, rootEntryList })
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
            containerRef?.current
              ?.querySelector(`.gagu-entry-node[data-entry-name="${safeQuotes(name)}"]`)
              ?.setAttribute('style', 'opacity:0;')
            deletedPaths.push(path)
          }
        }
        const { rootEntryList: list } = baseData
        const rootEntryList = list.filter((entry) => !deletedPaths.includes(getEntryPath(entry)))
        setBaseData({ ...baseData, rootEntryList })
        handleNavRefresh({ refreshParent: true })
        close()
      },
    })
  }, [deleteEntry, selectedEntryList, handleNavRefresh, t, setBaseData, baseData, containerRef])

  const handleSideCollapseChange = useCallback(() => {
    const isCollapsed = !sideCollapse
    setSideCollapse(isCollapsed)
    setUserConfig({ ...userConfig, fileExplorerSideCollapse: isCollapsed })
  }, [setUserConfig, sideCollapse, userConfig])

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
        const defaultRootEntry = rootEntryList
          .find(entry => entry.group === RootEntryGroup.user) || rootEntryList[0]
        handleDirectoryOpen(defaultRootEntry, true)
      }
    }
  }, [specifiedPath, currentPath, rootEntryList, handleDirectoryOpen, handleGoFullPath])

  useEffect(() => {
    const cache = Object.fromEntries(
      Object.entries(entryPathCache)
        .map(([path, data]) => {
          const newData = {...data}
          if (newData?.hiddenShow === false) {
            delete newData.hiddenShow
          }
          if (newData?.gridMode === !touchMode) {
            delete newData.gridMode
          }
          if (newData?.sortType === Sort.default) {
            delete newData.sortType
          }
          delete newData.list
          return [path, newData]
        })
        .filter(([, data]) => data && Object.keys(data).length)
    )
    EntryPathCacheStore.set(cache)
  }, [entryPathCache, touchMode])

  useEffect(() => {
    if (!clipboardData?.entryList.length) return
    const { entryList, entryList: [{ parentPath }] } = clipboardData
    const { list = [] } = entryPathCache[parentPath] || {}
    const isDisappeared = entryList.some(entry => list.every(o => !getIsSameEntry(o, entry)))
    if (isDisappeared) {
      const newEntryList = entryList.filter(entry => list.some(o => getIsSameEntry(o, entry)))
      setClipboardData(newEntryList.length
        ? {
          type: clipboardData.type,
          entryList: newEntryList,
        }
        : null
      )
    }
  }, [clipboardData, entryPathCache, setClipboardData])

  return {
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
  }
}
