import { useMemo } from 'react'
import { isSameEntry, line, vibrate } from '../../utils'
import { IApp, IEntry } from '../../types'
import { useTranslation } from 'react-i18next'
import { SvgIcon } from '../../components/common'
import { CALLABLE_APP_LIST } from '../../apps'

interface SelectionMenuProps {
  show: boolean
  favoriteEntryList: IEntry[]
  selectedEntryList: IEntry[]
  updateDirectorySize: (entry: IEntry) => void
  handleFavorite: (entry: IEntry, isFavorited: boolean) => void
  handleDownloadClick: (entryList: IEntry[]) => void
  handleShareClick: (entryList: IEntry[]) => void
  handleDeleteClick: (entryList: IEntry[]) => void
  onCancel: () => void
}

export default function SelectionMenu(props: SelectionMenuProps) {
  const {
    show,
    favoriteEntryList,
    selectedEntryList,
    updateDirectorySize,
    handleFavorite,
    handleDownloadClick,
    handleShareClick,
    handleDeleteClick,
    onCancel,
  } = props

  const { t } = useTranslation()

  const menuItemList = useMemo(() => {
    const confirmedCount = selectedEntryList.length
    const isOnBlank = confirmedCount === 0
    const isSingle = confirmedCount === 1

    let isFavorited = false
    let isOnDirectory = false

    if (isSingle) {
      const activeEntry = selectedEntryList[0]
      isFavorited = isSingle && favoriteEntryList.some(entry => isSameEntry(entry, activeEntry))
      isOnDirectory = activeEntry.type === 'directory'
    }

    const handleOpenEntry = (app: IApp) => {
      // setOpenOperation({
      //   app,
      //   matchedEntryList: contextEntryList,
      //   activeEntryIndex: 0,
      // })
    }

    return [
      {
        icon: <SvgIcon.Rename />,
        name: t`action.rename`,
        isShow: isSingle,
        onClick: () => {},
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
        })),
      },
      {
        icon: <SvgIcon.FolderInfo />,
        name: t`action.folderSize`,
        isShow: isOnDirectory && isSingle,
        onClick: () => updateDirectorySize(selectedEntryList[0]),
      },
      {
        icon: isFavorited ? <SvgIcon.Star /> : <SvgIcon.StarSolid />,
        name: isFavorited ? t`action.unfavorite` : t`action.favorite`,
        isShow: isOnDirectory && isSingle,
        onClick: () => handleFavorite(selectedEntryList[0], isFavorited),
      },

      {
        icon: <SvgIcon.Download />,
        name: t`action.download`,
        isShow: true,
        onClick: () => handleDownloadClick(selectedEntryList),
      },
      {
        icon: <SvgIcon.Share />,
        name: t`action.newSharing`,
        isShow: !isOnBlank,
        onClick: () => handleShareClick(selectedEntryList),
      },
      {
        icon: <SvgIcon.Delete />,
        name: t`action.delete`,
        isShow: !isOnBlank,
        onClick: () => handleDeleteClick(selectedEntryList),
      },
      {
        icon: <SvgIcon.CloseCircle />,
        name: t`action.cancel`,
        isShow: true,
        onClick: onCancel,
      },
    ].filter(item => item.isShow)
  }, [favoriteEntryList, handleDeleteClick, handleDownloadClick, handleFavorite, handleShareClick, onCancel, selectedEntryList, t, updateDirectorySize])


  return (
    <>
      <div
        className={line(`
          fixed z-10 right-[10px] bottom-[10px] left-[10px]
          p-2 border rounded-xl shadow-lg
          flex flex-wrap
          bg-white bg-opacity-80 backdrop-blur select-none
          transition-all duration-300
          ${show ? 'scale-100' : 'scale-0'}
        `)}
      >
        {menuItemList.map(({ icon, name, onClick }) => (
          <div
            key={name}
            className={line(`
              w-1/4 h-12 rounded-md
              transition-all duration-100
              active:scale-90 active:bg-gray-100
            `)}
            onClick={() => {
              vibrate()
              onClick()
              // setContextMenuData(null)
            }}
          >
            <div className="mt-1 flex justify-center">{icon}</div>
            <div className="mt-1 text-xs text-center">{name}</div>
          </div>
        ))}
      </div>
    </>
  )
}
