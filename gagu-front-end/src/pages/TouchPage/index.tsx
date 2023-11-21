import { Confirmor, EmptyPanel } from '../../components/common'
import { useRecoilState } from 'recoil'
import { activePageState, entryPathMapState, rootInfoState, transferSignalState, transferTaskListState } from '../../states'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import EntrySelector from '../../components/EntrySelector'
import MenuBar from '../../components/MenuBar'
import { IEntry, INestedFile, IRootEntry, IRootInfo, IUploadTransferTask, IVisitHistory, Page, Sort, SortType, TransferTaskStatus, TransferTaskType, TunnelType } from '../../types'
import { useTranslation } from 'react-i18next'
import { DOWNLOAD_PERIOD, getDownloadInfo, getEntryPath, getMatchedApp, isSameEntry, path2RootEntry, sortMethodMap, vibrate } from '../../utils'
import EntryNode from './EntryNode'
import { useRequest } from '../../hooks'
import { DownloadApi, FsApi, TunnelApi, UserApi } from '../../api'
import StatusBar from '../../apps/FileExplorer/StatusBar'
import ControlBar, { IControlBarDisabledMap } from '../../apps/FileExplorer/ControlBar'
import toast from 'react-hot-toast'
import SharingModal from '../../components/SharingModal'
import { throttle } from 'lodash-es'
import SelectionMenu from './SelectionMenu'
import FixedMenu from './FixedMenu'
import Side from './Side'

export default function TouchPage() {

  const { t } = useTranslation()

  const [activePage, setActivePage] = useRecoilState(activePageState)
  const [rootInfo, setRootInfo] = useRecoilState(rootInfoState)
  const [entryPathMap, setEntryPathMap] = useRecoilState(entryPathMapState)
  // const [, setOpenOperation] = useRecoilState(openOperationState)
  const [transferTaskList, setTransferTaskList] = useRecoilState(transferTaskListState)
  const [transferSignal, setTransferSignal] = useRecoilState(transferSignalState)

  const [currentPath, setCurrentPath] = useState('')
  const [filterText, setFilterText] = useState('')
  const [, setLastVisitedPath] = useState('')
  const [hiddenShow, setHiddenShow] = useState(false)
  const [selectedEntryList, setSelectedEntryList] = useState<IEntry[]>([])
  const [filterMode, setFilterMode] = useState(false)
  const [scrollHook, setScrollHook] = useState({ top: 0, height: 0 })
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [activeRootEntry, setActiveRootEntry] = useState<IRootEntry | null>(null)
  const [visitHistory, setVisitHistory] = useState<IVisitHistory>({ position: -1, list: [] })
  const [sharedEntryList, setSharedEntryList] = useState<IEntry[]>([])
  const [SharingModalShow, setSharingModalShow] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [sideShow, setSideShow] = useState(false)

  const { request: queryEntryList, loading: querying, setData } = useRequest(FsApi.queryEntryList)
  const { request: queryDirectorySize, loading: sizeQuerying } = useRequest(FsApi.queryDirectorySize)
  const { request: createUserFavorite } = useRequest(UserApi.createUserFavorite)
  const { request: removeUserFavorite } = useRequest(UserApi.removeUserFavorite)
  const { request: createTunnel } = useRequest(TunnelApi.createTunnel)
  const { request: deleteEntry, loading: deleting } = useRequest(FsApi.deleteEntry)

  const containerRef = useRef(null)
  const uploadInputRef = useRef(null)

  useEffect(() => {
    setSelectedEntryList([])
    setFilterMode(false)
    setFilterText('')
    setIsSelectionMode(false)
  }, [currentPath])

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

  const { rootEntryList, rootEntryPathList, favoriteEntryList } = useMemo(() => {
    const { rootEntryList, favoritePathList } = rootInfo
    const rootEntryPathList = rootEntryList.map(getEntryPath)
    const favoriteEntryList = favoritePathList?.map(path2RootEntry).filter(Boolean) || []
    return { rootEntryList, rootEntryPathList, favoriteEntryList }
  }, [rootInfo])

  const isInRoot = useMemo(() => rootEntryPathList.includes(currentPath), [rootEntryPathList, currentPath])

  useEffect(() => {
    const title = isInRoot
      ? (activeRootEntry?.name || currentPath)
      : currentPath.split('/').pop() as string
    document.title = title
  }, [currentPath, isInRoot, activeRootEntry])

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
    vibrate()
    setSideShow(false)
    const path = getEntryPath(rootEntry)
    handlePathChange({ path, direction: 'forward', pushPath: true, updateActiveRootEntry: true })
  }, [handlePathChange])

  useEffect(() => {
    setTimeout(() => setActivePage(Page.touch))
  }, [setActivePage])

  useEffect(() => {
    if (!currentPath && rootEntryList.length) {
      handleRootEntryClick(rootEntryList[0])
    }
  }, [currentPath, rootEntryList, handleRootEntryClick])

  const handleDirOpen = useCallback((entry: IEntry) => {
    const path = getEntryPath(entry)
    handlePathChange({ path, direction: 'forward', pushPath: true })
  }, [handlePathChange])

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

  const handleUploadClick = useCallback(() => {
    (uploadInputRef.current as any)?.click()
  }, [])

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

  const handleEntryClick = useCallback((entry: IEntry) => {
    vibrate()

    if (isSelectionMode) {
      let list = [...selectedEntryList]
      if (list.find(e => isSameEntry(e, entry))) {
        list = list.filter(e => !isSameEntry(e, entry))
      } else {
        list.push(entry)
      }
      setSelectedEntryList(list)
      return
    }

    const { type } = entry
    if (type === 'directory') {
      handleDirOpen(entry)
    } else {
      const app = getMatchedApp(entry)
      if (app) {
        // const matchedEntryList = entryList.filter(en => app.matchList?.includes(en.extension))
        // const activeEntryIndex = matchedEntryList.findIndex(en => en.name === name)
        // setOpenOperation({
        //   app,
        //   matchedEntryList,
        //   activeEntryIndex,
        // })
      } else {
        handleDownloadClick([entry])
      }
    }
  }, [handleDirOpen, isSelectionMode, selectedEntryList, handleDownloadClick])

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
  
  const handleNavToParent = useCallback(() => {
    const list = currentPath.split('/')
    list.pop()
    const path = list.join('/')
    handlePathChange({ path, direction: 'forward', pushPath: true })
  }, [currentPath, handlePathChange])
  
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

  const updateDirectorySize = useCallback(async (entry: IEntry) => {
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

  const disabledMap = useMemo(() => {
    const { position, list } = visitHistory
    const disabledMap: IControlBarDisabledMap = {
      navBack: position <= 0,
      navForward: list.length === position + 1,
      refresh: querying || !currentPath,
      navToParent: !currentPath || isInRoot,
      newDir: false,
      newTxt: false,
      rename: selectedEntryList.length !== 1,
      upload: false,
      download: isEntryListEmpty,
      delete: !selectedEntryList.length,
      selectAll: isEntryListEmpty,
    }
    return disabledMap
  }, [visitHistory, querying, currentPath, isInRoot, selectedEntryList, isEntryListEmpty])

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

  const handleShareClick = useCallback((entryList: IEntry[]) => {
    setSharedEntryList(entryList)
    setSharingModalShow(true)
  }, [])

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
        handleRefresh()
        close()
      },
    })
  }, [deleteEntry, selectedEntryList, handleRefresh, t, setRootInfo, rootInfo])

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

    }, [selectedEntryList, entryList, sideShow])

  return (
    <>
      <div
        className="fixed z-0 inset-0 overflow-hidden"
        data-touch-mode="true"
        onContextMenuCapture={e => e.preventDefault()}
      >
        <EntrySelector />
        <MenuBar />
        <Side
          sideShow={sideShow}
          setSideShow={setSideShow}
          currentPath={currentPath}
          rootEntryList={rootEntryList}
          favoriteEntryList={favoriteEntryList}
          handleRootEntryClick={handleRootEntryClick}
          handleFavorite={handleFavorite}
        />
        <div
          ref={containerRef}
          className={`
            absolute z-10 inset-0 top-6 bg-white transition-all duration-500
            ${activePage === Page.touch ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[10%]'}
            ${sideShow ? 'ease-in-out translate-x-56 opacity-20 overflow-y-hidden' : 'overflow-y-auto'}
          `}
          onContextMenu={handleContextMenu}
        >
          {sideShow && (
            <div
              className="absolute inset-0 z-50"
              onClick={() => {
                vibrate()
                setSideShow(false)
              }}
            />
          )}
          <div className="sticky z-20 top-0 bg-white select-none">
            <ControlBar
              {...{ windowWidth: 360, disabledMap, gridMode, filterMode, filterText, hiddenShow, sortType }}
              {...{ setFilterMode, setFilterText, setHiddenShow }}
              onGridModeChange={handleGridModeChange}
              onSortTypeChange={handleSortChange}
              onNavBack={handleNavBack}
              onNavForward={handleNavForward}
              onNavRefresh={handleRefresh}
              onNavAbort={() => abortController?.abort()}
              onNavToParent={handleNavToParent}
              onNewDir={() => {}}
              onNewTxt={() => {}}
              onRename={() => {}}
              onUpload={() => {}}
              onDownload={() => {}}
              onDelete={() => {}}
              onSelectAll={() => {}}
            />
            <StatusBar
              {...{ folderCount, fileCount, currentPath, rootEntry: activeRootEntry, selectedEntryList }}
              loading={querying}
              onDirClick={handleGoFullPath}
              onRootEntryClick={handleRootEntryClick}
            />
          </div>
          <div
            className="flex flex-wrap px-1 py-2 pb-36 select-none"
          >
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
                    isSelectionMode,
                    isSelected,
                    isFavorited,
                    supportThumbnail,
                    entryPathMap,
                    scrollHook,
                  }}
                  requestState={{ deleting, sizeQuerying }}
                  onClick={(e, entry) => handleEntryClick(entry)}
                />
              )
            })}
          </div>

          <EmptyPanel show={!querying && isEntryListEmpty} />

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
        visible={SharingModalShow}
        entryList={sharedEntryList}
        onClose={() => setSharingModalShow(false)}
      />

      <SelectionMenu
        show={isSelectionMode}
        favoriteEntryList={favoriteEntryList}
        selectedEntryList={selectedEntryList}
        updateDirectorySize={updateDirectorySize}
        handleFavorite={handleFavorite}
        handleDownloadClick={handleDownloadClick}
        handleShareClick={handleShareClick}
        handleDeleteClick={handleDeleteClick}
        onCancel={() => {
          setIsSelectionMode(false)
          setSelectedEntryList([])
        }}
      />

      <FixedMenu
        sideShow={sideShow}
        setSideShow={setSideShow}
        isSelectionMode={isSelectionMode}
        disabledMap={disabledMap}
        handleUploadClick={handleUploadClick}
      />
    </>
  )
}
