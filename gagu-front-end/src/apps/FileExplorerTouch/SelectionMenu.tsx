import { useMemo } from 'react'
import { isSameEntry, line } from '../../utils'
import { EditMode, EditModeType, IApp, IEntry } from '../../types'
import { useTranslation } from 'react-i18next'
import { SvgIcon } from '../../components/common'
import { CALLABLE_APP_LIST } from '../../apps'

interface SelectionMenuProps {
  show: boolean
  asSelector?: boolean
  favoriteEntryList: IEntry[]
  selectedEntryList: IEntry[]
  onEdit: (mode: EditModeType, entry?: IEntry) => void
  onDirectorySizeUpdate: (entry: IEntry) => void
  onFavoriteClick: (entry: IEntry, isFavorited: boolean) => void
  onUploadClick: () => void
  onDownloadClick: (entryList: IEntry[]) => void
  onShareClick: (entryList: IEntry[]) => void
  onDeleteClick: (entryList: IEntry[]) => void
  onSelectAll: () => void
  onCancel: () => void
}

export default function SelectionMenu(props: SelectionMenuProps) {
  const {
    show,
    asSelector = false,
    favoriteEntryList,
    selectedEntryList,
    onEdit,
    onDirectorySizeUpdate,
    onFavoriteClick,
    onUploadClick,
    onDownloadClick,
    onShareClick,
    onDeleteClick,
    onSelectAll,
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

    const onOpenEntry = (app: IApp) => {
      // setOpenEvent({
      //   app,
      //   matchedEntryList: contextEntryList,
      //   activeEntryIndex: 0,
      // })
    }

    return [
      {
        icon: <SvgIcon.FolderAdd />,
        name: t`action.newFolder`,
        isShow: true,
        onClick: () => onEdit(EditMode.createFolder),
      },
      {
        icon: <SvgIcon.FileAdd />,
        name: t`action.newTextFile`,
        isShow: true,
        onClick: () => onEdit(EditMode.createText),
      },
      {
        icon: <SvgIcon.Upload />,
        name: t`action.upload`,
        isShow: true,
        onClick: onUploadClick,
      },
      {
        icon: <SvgIcon.Download />,
        name: t`action.download`,
        isShow: true,
        onClick: () => onDownloadClick(selectedEntryList),
      },
      {
        icon: <SvgIcon.Check />,
        name: t`action.selectAll`,
        isShow: true,
        noCancel: true,
        onClick: () => onSelectAll(),
      },
      {
        icon: <SvgIcon.Rename />,
        name: t`action.rename`,
        isShow: isSingle,
        onClick: () => onEdit(EditMode.rename, selectedEntryList[0]),
      },
      {
        icon: <SvgIcon.Apps />,
        name: t`action.openWith`,
        isShow: !isOnDirectory && isSingle && !asSelector,
        onClick: () => { },
        children: CALLABLE_APP_LIST.map(app => ({
          icon: <div className="gagu-app-icon w-4 h-4" data-app-id={app.id} />,
          name: t(`app.${app.id}`),
          onClick: () => onOpenEntry(app),
        })),
      },
      {
        icon: <SvgIcon.FolderInfo />,
        name: t`action.folderSize`,
        isShow: isOnDirectory && isSingle,
        onClick: () => onDirectorySizeUpdate(selectedEntryList[0]),
      },
      {
        icon: isFavorited ? <SvgIcon.Star /> : <SvgIcon.StarSolid />,
        name: isFavorited ? t`action.unfavorite` : t`action.favorite`,
        isShow: isOnDirectory && isSingle,
        onClick: () => onFavoriteClick(selectedEntryList[0], isFavorited),
      },
      {
        icon: <SvgIcon.Share />,
        name: t`action.newSharing`,
        isShow: !isOnBlank && !asSelector,
        onClick: () => onShareClick(selectedEntryList),
      },
      {
        icon: <SvgIcon.Delete />,
        name: t`action.delete`,
        isShow: !isOnBlank,
        onClick: () => onDeleteClick(selectedEntryList),
      },
      {
        icon: <SvgIcon.CloseCircle />,
        name: t`action.cancel`,
        isShow: true,
        onClick: () => {},
      },
    ].filter(item => item.isShow)
  }, [
    t,
    asSelector,
    selectedEntryList,
    onSelectAll,
    favoriteEntryList,
    onEdit,
    onDirectorySizeUpdate,
    onFavoriteClick,
    onUploadClick,
    onDownloadClick,
    onShareClick,
    onDeleteClick,
  ])

  return (
    <>
      <div
        className={line(`
          fixed z-10 right-[8px] bottom-[8px] left-[8px]
          p-2 border rounded-xl shadow-lg
          flex flex-wrap
          bg-white bg-opacity-80 backdrop-blur select-none overflow-y-auto
          transition-all duration-300
          ${show ? 'h-28 scale-100' : 'h-0 scale-0'}
        `)}
      >
        {menuItemList.map(({ icon, name, noCancel, onClick }) => (
          <div
            key={name}
            className={line(`
              mb-1 w-1/5 h-10 rounded-md
              transition-all duration-100
              active:scale-90 active:bg-gray-100
            `)}
            onClick={() => {
              onClick()
              !noCancel && onCancel()
            }}
          >
            <div className="mt-1 flex justify-center">{icon}</div>
            <div className="mt-1 -mx-1 text-xs text-center truncate scale-90">{name}</div>
          </div>
        ))}
      </div>
    </>
  )
}
