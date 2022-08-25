import { IApp, IEntry, IOpenOperation } from '../../utils/types'
import { CALLABLE_APP_LIST } from '../../utils/appList'
import { useCallback, useMemo } from 'react'
import { FsApi } from '../../api'
import iina from '../../img/icons/iina.png'
import { SvgIcon } from '../../components/base'

const openInIINA = (entry: IEntry) => {
  if (!entry) return
  const { name, parentPath } = entry
  const a = document.createElement('a')
  a.href = `iina://open?url=${FsApi.getFileStreamUrl(`${parentPath}/${name}`)}`
  a.click()
}

interface MenusProps {
  top: number
  left: number
  target: any
  entryList: IEntry[]
  selectedEntryList: IEntry[]
  setOpenOperation: (operation: IOpenOperation) => void
  setSelectedEntryList: (entry: IEntry[]) => void
  setNewDirMode: (mode: boolean) => void
  setNewTxtMode: (mode: boolean) => void
  updateDirSize: (entry: IEntry) => void
  handleRefresh: () => void
  handleRename: () => void
  handleUploadClick: () => void
  handleDownloadClick: (entryList?: IEntry[]) => void
  handleDeleteClick: (entryList?: IEntry[]) => void
  onClose: () => void
}

export default function Menus(props: MenusProps) {

  const {
    top,
    left,
    target,
    entryList,
    selectedEntryList,
    setOpenOperation,
    setSelectedEntryList,
    setNewDirMode,
    setNewTxtMode,
    updateDirSize,
    handleRefresh,
    handleRename,
    handleUploadClick,
    handleDownloadClick,
    handleDeleteClick,
    onClose,
  } = props

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

      const isDir = targetEntry.getAttribute('data-is-folder') === 'true'
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

    return {
      isOnBlank,
      isOnDir,
      contextEntryList,
      isSingleConfirmed,
    }
  }, [target, selectedEntryList, entryList, setSelectedEntryList])

  const handleOpenEntry = useCallback((app: IApp) => {

    // const matchedEntryList = contextEntryList.filter(en => app.matchList?.includes(en.extension))
    // const activeEntryIndex = matchedEntryList.findIndex(en => en.name === name)
    setOpenOperation({
      app,
      matchedEntryList: contextEntryList,
      activeEntryIndex: 0,
    })
  }, [contextEntryList, setOpenOperation])

  const actions = useMemo(() => {
    return [
      {
        icon: <SvgIcon.FolderAdd />,
        text: '新建文件夹',
        isShow: isOnBlank,
        onClick: () => setNewDirMode(true),
      },
      {
        icon: <SvgIcon.FileAdd />,
        text: '新建文本文件',
        isShow: isOnBlank,
        onClick: () => setNewTxtMode(true),
      },
      {
        icon: <SvgIcon.Refresh />,
        text: '刷新',
        isShow: isOnBlank,
        onClick: handleRefresh,
      },
      {
        icon: <SvgIcon.Edit />,
        text: '重命名',
        isShow: isSingleConfirmed,
        onClick: () => setTimeout(handleRename, 0),
      },
      {
        icon: <SvgIcon.Apps />,
        text: '打开方式',
        isShow: !isOnDir && isSingleConfirmed,
        onClick: () => { },
        children: CALLABLE_APP_LIST.map(app => ({
          icon: <div className="app-icon w-4 h-4" data-app-id={app.id} />,
          text: app.title,
          onClick: () => handleOpenEntry(app),
        })).concat({
          icon: <img src={iina} alt="iina" className="w-4 h-4" />,
          text: 'IINA',
          onClick: () => openInIINA(contextEntryList[0]),
        }),
      },
      {
        icon: <SvgIcon.FolderInfo />,
        text: '文件夹大小',
        isShow: isOnDir,
        onClick: () => updateDirSize(contextEntryList[0]),
      },
      {
        icon: <SvgIcon.Upload />,
        text: '上传',
        isShow: isOnBlank,
        onClick: handleUploadClick,
      },
      {
        icon: <SvgIcon.Download />,
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
        icon: <SvgIcon.Delete />,
        text: '删除',
        isShow: !isOnBlank,
        onClick: () => handleDeleteClick(contextEntryList),
      },
    ]
  }, [
    contextEntryList, isOnBlank, isOnDir, isSingleConfirmed,
    setNewDirMode, setNewTxtMode, updateDirSize, handleOpenEntry,
    handleDeleteClick, handleDownloadClick, handleRefresh, handleRename, handleUploadClick,
  ])

  return (
    <div
      className="absolute z-10 py-1 w-44 bg-white-900 backdrop-filter backdrop-blur shadow-lg border"
      style={{ top: top - 24, left: left - 134 }}
    >
      {actions
        .filter(({ isShow }) => isShow)
        .map(({ icon, text, onClick, children }) => (
          <div
            key={encodeURIComponent(text)}
            className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
            onClick={() => {
              onClick()
              !children && onClose()
            }}
          >
            <div className="relative flex items-center group">
              {icon}
              <span className="ml-2 flex-grow">{text}</span>
              {children && <SvgIcon.ChevronRight />}
              {children && (
                <div className="absolute top-0 left-0 w-44 ml-40 hidden group-hover:block py-1 bg-white-800 backdrop-filter backdrop-blur shadow-lg border">
                  {children.map(({ icon, text, onClick }) => (
                    <div
                      key={encodeURIComponent(text)}
                      className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm flex items-center"
                      onClick={() => {
                        onClick()
                        onClose()
                      }}
                    >
                      {icon}
                      <span className="ml-2 flex-grow">{text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      }
    </div>
  )
}
