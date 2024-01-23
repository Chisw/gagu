import { useCallback, useEffect, useMemo, useState } from 'react'
import { getIsSameEntry, line } from '../../utils'
import { ClipboardType, EditMode, EditModeType, EventTransaction, IClipboardData, IEntry } from '../../types'
import { useTranslation } from 'react-i18next'
import { SvgIcon } from '../../components/common'
import { CALLABLE_APP_LIST } from '../../apps'
import { Modal } from '@douyinfe/semi-ui'
import { useRecoilState } from 'recoil'
import { openEventState } from '../../states'

interface SelectionMenuProps {
  show: boolean
  asEntryPicker?: boolean
  favoriteRootEntryList: IEntry[]
  selectedEntryList: IEntry[]
  clipboardData: IClipboardData | null
  setMovementEntryPickerShow: (show: boolean) => void
  setGoToPathDialogShow: (show: boolean) => void
  onClipboardAdd: (data: IClipboardData) => void
  onClipboardPaste: () => void
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
    asEntryPicker = false,
    favoriteRootEntryList,
    selectedEntryList,
    clipboardData,
    setMovementEntryPickerShow,
    setGoToPathDialogShow,
    onClipboardAdd,
    onClipboardPaste,
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
      isFavorited = isSingle && favoriteRootEntryList.some(entry => getIsSameEntry(entry, activeEntry))
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
        icon: <SvgIcon.Paste />,
        name: t`action.paste` + ` (${clipboardData?.entryList.length})`,
        isShow: !!clipboardData,
        onClick: onClipboardPaste,
      },
      {
        icon: <SvgIcon.Copy />,
        name: t`action.copy`,
        isShow: !!selectedEntryList.length,
        onClick: () => onClipboardAdd({
          type: ClipboardType.copy,
          entryList: selectedEntryList,
        }),
      },
      {
        icon: <SvgIcon.Cut />,
        name: t`action.cut`,
        isShow: !!selectedEntryList.length,
        onClick: () => onClipboardAdd({
          type: ClipboardType.cut,
          entryList: selectedEntryList,
        }),
      },
      {
        icon: <SvgIcon.MoveTo />,
        name: t`action.moveTo`,
        isShow: !isOnBlank,
        noCancel: true,
        onClick: () => setMovementEntryPickerShow(true),
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
        isShow: !isOnDirectory && isSingle && !asEntryPicker,
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
        isShow: !isOnBlank && !asEntryPicker,
        onClick: () => onShareClick(selectedEntryList),
      },
      {
        icon: <SvgIcon.Delete />,
        name: t`action.delete`,
        isShow: !isOnBlank,
        onClick: () => onDeleteClick(selectedEntryList),
      },
      {
        icon: <SvgIcon.Run />,
        name: t`action.goTo`,
        isShow: isOnBlank,
        onClick: () => setGoToPathDialogShow(true),
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
    asEntryPicker,
    selectedEntryList,
    favoriteRootEntryList,
    clipboardData,
    setMovementEntryPickerShow,
    setGoToPathDialogShow,
    onClipboardAdd,
    onClipboardPaste,
    onSelectAll,
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
      transaction: EventTransaction.run_app,
      appId,
      entryList: selectedEntryList,
      forceOpen: true,
    })
  }, [selectedEntryList, setOpenEvent])

  useEffect(() => {
    !show && setAppsModalShow(false)
  }, [show])

  return (
    <>
      <div
        className={line(`
          fixed z-10 right-[8px] bottom-[8px] left-[8px]
          border rounded-xl shadow-lg overflow-hidden
          bg-white bg-opacity-90 backdrop-blur select-none
          transition-all duration-300
          dark:bg-zinc-700 dark:bg-opacity-90 dark:border-zinc-600
          ${show ? 'h-28 scale-100' : 'h-0 scale-0'}
        `)}
      >
        <div className="absolute z-0 inset-0 p-2 overflow-y-auto flex flex-wrap">
          {menuItemList.map(({ icon, name, noCancel, onClick }) => (
            <div
              key={name}
              className={line(`
                mb-1 w-1/5 h-10 rounded-md
                transition-all duration-100
                active:scale-90 active:bg-gray-100
                dark:text-zinc-200 dark:active:bg-zinc-800
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

        <div className="absolute z-10 top-0 left-0 w-full h-4 bg-gradient-to-b from-white to-transparent dark:from-zinc-700" />
        <div className="absolute z-10 bottom-0 left-0 w-full h-4 bg-gradient-to-t from-white to-transparent dark:from-zinc-700" />
      </div>

      <Modal
        visible={appsModalShow}
        closable={false}
        footer={null}
        className="gagu-touch-open-with-apps select-none"
        onCancel={() => setAppsModalShow(false)}
      >
        <div className="p-3">
          <div className="mb-4 text-gray-600 dark:text-zinc-200">
            {t(`action.openWith`)}
          </div>
          <div className="flex">
            {CALLABLE_APP_LIST.map(({ id }) => (
              <div
                key={id}
                data-app-id={id}
                className="gagu-app-icon mr-4 w-12 h-12 transition-all duration-100 active:scale-95"
                onClick={() => {
                  onCancel()
                  setAppsModalShow(false)
                  handleOpenEntry(id)
                }}
              >
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  )
}
