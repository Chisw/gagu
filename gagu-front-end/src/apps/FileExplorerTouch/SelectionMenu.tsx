import { useCallback, useMemo, useState } from 'react'
import { isSameEntry, line } from '../../utils'
import { EditMode, EditModeType, EventTransaction, IEntry } from '../../types'
import { useTranslation } from 'react-i18next'
import { SvgIcon } from '../../components/common'
import { CALLABLE_APP_LIST } from '../../apps'
import { Modal } from '@douyinfe/semi-ui'
import { useRecoilState } from 'recoil'
import { openEventState } from '../../states'

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

  const [, setOpenEvent] = useRecoilState(openEventState)

  const [appsModalShow, setAppsModalShow] = useState(false)

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
        noCancel: true,
        onClick: () => setAppsModalShow(true),
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

  const handleOpenEntry = useCallback((appId: string) => {
    setOpenEvent({
      transaction: EventTransaction.app_run,
      appId,
      entryList: selectedEntryList,
    })
  }, [selectedEntryList, setOpenEvent])

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

      <Modal
        centered
        width="80vw"
        visible={appsModalShow}
        closable={false}
        footer={null}
        className="gagu-touch-open-with-apps select-none"
        onCancel={() => setAppsModalShow(false)}
      >
        {CALLABLE_APP_LIST.map(({ id }) => (
          <div
            key={id}
            className="p-3 flex items-center transition-all duration-100 active:scale-95 active:bg-gray-100 rounded-lg"
            onClick={() => {
              onCancel()
              setAppsModalShow(false)
              handleOpenEntry(id)
            }}
          >
            <div
              className="gagu-app-icon w-12 h-12"
              data-app-id={id}
            />
            <div className="ml-3 text-lg">
              {t(`app.${id}`)}
            </div>
          </div>
        ))}
        
      </Modal>
    </>
  )
}
