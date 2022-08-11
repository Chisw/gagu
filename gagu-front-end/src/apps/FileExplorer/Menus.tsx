import { ContextMenu, Menu, MenuItem } from '@blueprintjs/core'
import { IApp, IEntry, IOpenedEntry } from '../../utils/types'
import APP_LIST from '../../utils/appList'
import { useCallback, useMemo } from 'react'
import { FsApi } from '../../api'
import iina from '../../img/icons/iina.png'
import RemixIcon from '../../img/remixicon'

const availableAppIdList = ['text-editor', 'photo-gallery', 'music-player', 'video-player']

const openInIINA = (entry: IEntry) => {
  if (!entry) return
  const { name, parentPath } = entry
  const a = document.createElement('a')
  a.href = `iina://open?url=${FsApi.getBinFileUrl(`${parentPath}/${name}`)}`
  a.click()
}

interface MenusProps {
  target: any
  currentDirPath: string
  entryList: IEntry[]
  selectedEntryList: IEntry[]
  setOpenedEntryList: (entries: IOpenedEntry[]) => void
  setSelectedEntryList: (entry: IEntry[]) => void
  setNewDirMode: (mode: boolean) => void
  setNewTxtMode: (mode: boolean) => void
  updateDirSize: (entry: IEntry) => void
  handleRefresh: () => void
  handleRename: () => void
  handleUploadClick: () => void
  handleDownloadClick: (entries?: IEntry[]) => void
  handleDeleteClick: (entries?: IEntry[]) => void
}

export default function Menus(props: MenusProps) {

  const {
    target,
    currentDirPath,
    entryList,
    selectedEntryList,
    setOpenedEntryList,
    setSelectedEntryList,
    setNewDirMode,
    setNewTxtMode,
    updateDirSize,
    handleRefresh,
    handleRename,
    handleUploadClick,
    handleDownloadClick,
    handleDeleteClick,
  } = props

  const availableAppMap = useMemo(() => {
    const availableAppMap: { [KEY: string]: IApp } = {}
    APP_LIST.forEach(app => {
      if (availableAppIdList.includes(app.id)) {
        availableAppMap[app.id] = app
      }
    })
    return availableAppMap
  }, [])

  const {
    isOnBlank,
    isOnDir,
    contextEntryList,
    isSingleConfirmed,
  } = useMemo(() => {
    let isOnBlank = true
    let isOnDir = false
    let contextEntryList: IEntry[] = [...selectedEntryList]

    const unconfirmedLen = contextEntryList.length
    const targetEntry = target.closest('.entry-node')

    if (targetEntry) {
      isOnBlank = false

      const isDir = targetEntry.getAttribute('data-dir') === 'true'
      const entryName = targetEntry.getAttribute('data-name')
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

    return {
      isOnBlank,
      isOnDir,
      contextEntryList,
      isSingleConfirmed,
    }
  }, [target, selectedEntryList, entryList, setSelectedEntryList])

  const handleOpenEntry = useCallback((appId: string) => {
    const list = contextEntryList.map(entry => ({
      ...entry,
      parentPath: currentDirPath,
      openAppId: appId,
      isOpen: false,
    }))
    setOpenedEntryList(list)
  }, [contextEntryList, currentDirPath, setOpenedEntryList])

  const actions = useMemo(() => {
    return [
      {
        icon: <RemixIcon.FolderAdd />,
        text: '新建文件夹',
        isShow: isOnBlank,
        onClick: () => setNewDirMode(true),
      },
      {
        icon: <RemixIcon.FileAdd />,
        text: '新建文本文件',
        isShow: isOnBlank,
        onClick: () => setNewTxtMode(true),
      },
      {
        icon: <RemixIcon.Refresh />,
        text: '刷新',
        isShow: isOnBlank,
        onClick: handleRefresh,
      },
      {
        icon: <RemixIcon.Edit />,
        text: '重命名',
        isShow: isSingleConfirmed,
        onClick: () => setTimeout(handleRename, 0),
      },
      {
        icon: <RemixIcon.Apps />,
        text: '打开方式',
        isShow: !isOnDir && isSingleConfirmed,
        onClick: () => { },
        children: availableAppIdList.map(appId => ({
          icon: <img src={availableAppMap[appId].icon} alt="app" className="w-4 h-4" />,
          text: availableAppMap[appId].title,
          onClick: () => handleOpenEntry(appId),
        })).concat({
          icon: <img src={iina} alt="iina" className="w-4 h-4" />,
          text: 'IINA',
          onClick: () => openInIINA(contextEntryList[0]),
        }),
      },
      {
        icon: <RemixIcon.FolderInfo />,
        text: '文件夹大小',
        isShow: isOnDir,
        onClick: () => updateDirSize(contextEntryList[0]),
      },
      {
        icon: <RemixIcon.Upload />,
        text: '上传',
        isShow: isOnBlank,
        onClick: handleUploadClick,
      },
      {
        icon: <RemixIcon.Download />,
        text: '下载',
        isShow: true,
        onClick: () => handleDownloadClick(contextEntryList),
      },
      // {
      //   icon: <></>,
      //   text: '收藏',
      //   isShow: isOnDir,
      //   onClick: () => { },
      // },
      {
        icon: <RemixIcon.Delete />,
        text: '删除',
        isShow: !isOnBlank,
        onClick: () => handleDeleteClick(contextEntryList),
      },
    ]
  }, [
    availableAppMap, contextEntryList, isOnBlank, isOnDir, isSingleConfirmed,
    setNewDirMode, setNewTxtMode, updateDirSize, handleOpenEntry,
    handleDeleteClick, handleDownloadClick, handleRefresh, handleRename, handleUploadClick,
  ])

  return (
    <Menu className="force-outline-none">
      {actions
        .filter(({ isShow }) => isShow)
        .map(({ icon, text, onClick, children }) => (
          <MenuItem
            key={encodeURIComponent(text)}
            icon={icon}
            text={text}
            onClick={() => {
              onClick()
              !children && ContextMenu.hide()
            }}
          >
            {children && children.map(({ icon, text, onClick }) => (
              <MenuItem
                key={encodeURIComponent(text)}
                icon={<span className="bp3-icon">{icon}</span>}
                text={text}
                onClick={() => {
                  onClick()
                  ContextMenu.hide()
                }}
              />
            ))}
          </MenuItem>
        ))
      }
    </Menu>
  )
}
