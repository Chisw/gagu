import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { getIsSameEntry, line } from '../../utils'
import { activePageState, userInfoState, runningAppListState, topWindowIndexState } from '../../states'
import EntryNode from '../../apps/FileExplorer/EntryNode'
import { AppId, ClipboardState, CreationType, EditMode, EntryType, IApp, IEntry, Page } from '../../types'
import { useWorkArea } from '../../hooks'
import { EntryPicker, EntryPickerMode, SharingModal } from '../../components'
import { APP_LIST } from '../../apps'
import { useTranslation } from 'react-i18next'

export default function Desktop() {

  const { t } = useTranslation()

  const [activePage] = useRecoilState(activePageState)
  const [userInfo] = useRecoilState(userInfoState)
  const [topWindowIndex, setTopWindowIndex] = useRecoilState(topWindowIndexState)
  const [runningAppList, setRunningAppList] = useRecoilState(runningAppListState)

  const [show, setShow] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const isTopWindow = useMemo(() => currentIndex === topWindowIndex, [currentIndex, topWindowIndex])

  const handleSetDesktopActive = useCallback(() => {
    const newTopIndex = topWindowIndex + 1
    setCurrentIndex(newTopIndex)
    setTopWindowIndex(newTopIndex)
  }, [topWindowIndex, setTopWindowIndex])

  const handleOpenDesktopDirectory = useCallback((entry: IEntry) => {
      setTopWindowIndex(topWindowIndex + 1)
      const app = APP_LIST.find(app => app.id === AppId.fileExplorer)!
      const list: IApp[] = [...runningAppList, { ...app, runningId: Date.now(), additionalEntryList: [entry] }]
      setRunningAppList(list)
  }, [runningAppList, setRunningAppList, setTopWindowIndex, topWindowIndex])

  const {
    kiloSize, clipboardData,
    lassoRef, containerRef, containerInnerRef,
    supportThumbnail, thumbScrollWatcher,
    currentPath,
    entryList, selectedEntryList,
    favoriteRootEntryList, sharingEntryList,
    querying, sizeQuerying, deleting,
    sharingModalShow, setSharingModalShow,
    movementEntryPickerShow, setMovementEntryPickerShow,
    editMode, handleNameSuccess, handleNameFail,
    handleEntryClick, handleEntryDoubleClick,
    handleMove,
    handleSelectCancel,
    handleContextMenu,
  } = useWorkArea({
    isUserDesktop: true,
    isTopWindow,
    asEntryPicker: false,
    specifiedPath: userInfo?.userPath ? `${userInfo?.userPath}/desktop` : '',
    onCurrentPathChange: () => {},
    onPick: () => {},
    onPickDoubleConfirm: () => {},
    onOpenDesktopDirectory: handleOpenDesktopDirectory,
  })

  useEffect(() => {
    if (activePage === Page.desktop) {
      setTimeout(() => setShow(true), 800)
    } else {
      setShow(false)
    }
  }, [activePage])

  return (
    <>
      <div
        ref={containerRef}
        className={line(`
          gagu-user-desktop
          gagu-entry-list-container
          absolute z-0 inset-0 top-8 md:top-6 bottom-0 select-none
          ${isTopWindow ? 'is-top-window' : ''}
        `)}
        onMouseDownCapture={handleSelectCancel}
      >
        <div
          ref={lassoRef}
          className="gagu-work-area-lasso"
        />
        <div
          ref={containerInnerRef}
          className={line(`
            gagu-entry-list-container-inner
            w-full h-full p-3 flex flex-col flex-wrap content-start
            transition-opacity duration-500
            ${show ? 'opacity-100' : 'opacity-0'}
            ${querying ? 'opacity-50 pointer-events-none' : ''}
          `)}
          onMouseDownCapture={handleSetDesktopActive}
          onContextMenu={handleContextMenu}
        >
          {/* create */}
          {[EditMode.createFolder, EditMode.createText].includes(editMode as CreationType) && (
            <EntryNode
              inputMode
              gridMode
              entry={{
                name: '',
                type: editMode === EditMode.createFolder ? 'directory' : 'file',
                lastModified: 0,
                hidden: false,
                hasChildren: false,
                parentPath: currentPath,
                extension: editMode === EditMode.createFolder ? '_dir_new' : '_txt_new',
              }}
              kiloSize={kiloSize}
              creationType={editMode as CreationType}
              onNameSuccess={handleNameSuccess}
              onNameFail={handleNameFail}
            />
          )}

          {/* entry list */}
          {entryList.map(entry => {
            const isSelected = selectedEntryList.some(o => getIsSameEntry(o, entry))
            const isFavorited = favoriteRootEntryList.some(o => getIsSameEntry(o, entry))
            const inputMode = editMode === EditMode.rename && isSelected

            const isInClipboard = clipboardData?.entryList.length &&
              clipboardData.entryList.some((o) => getIsSameEntry(o, entry))

            const clipboardState: ClipboardState = isInClipboard
              ? clipboardData.type
              : undefined

            return (
              <EntryNode
                key={encodeURIComponent(`${entry.name}-${entry.type}`)}
                {...{
                  kiloSize,
                  entry,
                  gridMode: true,
                  inputMode,
                  isSelected,
                  isFavorited,
                  supportThumbnail,
                  thumbScrollWatcher,
                  clipboardState,
                }}
                draggable={!inputMode}
                requestState={{ deleting, sizeQuerying }}
                onClick={handleEntryClick}
                onDoubleClick={handleEntryDoubleClick}
                onNameSuccess={handleNameSuccess}
                onNameFail={handleNameFail}
              />
            )
          })}
        </div>
      </div>

      <SharingModal
        show={sharingModalShow}
        entryList={sharingEntryList}
        onClose={() => setSharingModalShow(false)}
      />

      <EntryPicker
        show={movementEntryPickerShow}
        appId={AppId.fileExplorer}
        mode={EntryPickerMode.open}
        type={EntryType.directory}
        title={t`action.moveTo`}
        onConfirm={({ pickedPath }) => {
          handleMove(selectedEntryList, pickedPath)
          setMovementEntryPickerShow(false)
        }}
        onCancel={() => setMovementEntryPickerShow(false)}
      />

    </>
  )
}
