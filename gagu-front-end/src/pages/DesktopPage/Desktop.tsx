import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { sameEntry, line } from '../../utils'
import { activePageState, baseDataState, runningAppListState, topWindowIndexState } from '../../states'
import EntryNode from '../../apps/FileExplorer/EntryNode'
import { AppId, CreationType, EditMode, IApp, IEntry, Page } from '../../types'
import { useWorkArea } from '../../hooks'
import { SharingModal } from '../../components'
import { APP_LIST } from '../../apps'

export default function Desktop() {

  const [activePage] = useRecoilState(activePageState)
  const [baseData] = useRecoilState(baseDataState)
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
      const list: IApp[] = [...runningAppList, { ...app, runningId: Date.now(), addtionalEntryList: [entry] }]
      setRunningAppList(list)
  }, [runningAppList, setRunningAppList, setTopWindowIndex, topWindowIndex])

  const {
    lassoRef, containerRef, containerInnerRef,
    supportThumbnail, thumbScrollWatcher,
    currentPath,
    entryList, selectedEntryList,
    favoriteEntryList, sharingEntryList,
    querying, sizeQuerying, deleting,
    sharingModalShow, setSharingModalShow,
    editMode, handleNameSuccess, handleNameFail,
    handleEntryClick, handleEntryDoubleClick,
    handleSelectCancel,
    handleContextMenu,
  } = useWorkArea({
    isUserDesktop: true,
    isTopWindow,
    asSelector: false,
    specifiedPath: `${baseData.userPath}/desktop`,
    onCurrentPathChange: () => {},
    onSelect: () => {},
    onSelectDoubleConfirm: () => {},
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
        className="gagu-desktop gagu-entry-list-container absolute z-0 inset-0 top-8 md:top-6 bottom-[56px] select-none"
        onMouseDownCapture={handleSelectCancel}
      >
        <div
          ref={lassoRef}
          className="hidden absolute z-10 border box-content border-gray-400 bg-black bg-opacity-10 pointer-events-none"
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
              creationType={editMode as CreationType}
              onNameSuccess={handleNameSuccess}
              onNameFail={handleNameFail}
            />
          )}

          {/* entry list */}
          {entryList.map(entry => {
            const isSelected = selectedEntryList.some(o => sameEntry(o, entry))
            const isFavorited = favoriteEntryList.some(o => sameEntry(o, entry))
            const inputMode = editMode === EditMode.rename && isSelected
            return (
              <EntryNode
                key={encodeURIComponent(`${entry.name}-${entry.type}`)}
                {...{
                  entry,
                  gridMode: true,
                  inputMode,
                  isSelected,
                  isFavorited,
                  supportThumbnail,
                  thumbScrollWatcher,
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
    </>
  )
}
