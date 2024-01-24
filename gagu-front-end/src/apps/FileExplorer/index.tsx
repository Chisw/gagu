import { useEffect } from 'react'
import { EntryPicker, EntryPickerMode, SharingModal } from '../../components'
import { useWorkArea } from '../../hooks'
import StatusBar from './StatusBar'
import ControlBar from './ControlBar'
import Side from './Side'
import { EmptyPanel } from '../../components/common'
import { getEntryPath, getIsSameEntry, line } from '../../utils'
import { FileExplorerProps, EditMode, CreationType, AppId, EntryType, ClipboardState } from '../../types'
import EntryNode from './EntryNode'
import GoToPathDialog from './GoToPathDialog'
import { useTranslation } from 'react-i18next'

export default function FileExplorer(props: FileExplorerProps) {

  const {
    isTopWindow,
    windowSize: { width: windowWidth },
    setWindowTitle,
    additionalEntryList,
    asEntryPicker = false,
    onCurrentPathChange = () => {},
    onPick = () => {},
    onPickDoubleConfirm = () => {},
  } = props

  const { t } = useTranslation()

  const {
    kiloSize, clipboardData,
    lassoRef, containerRef, containerInnerRef,
    supportThumbnail, thumbScrollWatcher,
    currentPath, currentRootEntry,
    entryList, selectedEntryList,
    favoriteRootEntryList, rootEntryList, sharingEntryList,
    isEntryListEmpty, disabledMap,
    folderCount, fileCount,
    querying, sizeQuerying, deleting,
    filterMode, setFilterMode,
    filterText, setFilterText,
    sideCollapse, handleSideCollapseChange,
    hiddenShow, handleHiddenShowChange,
    gridMode, handleGridModeChange,
    sortType, handleSortChange,
    sharingModalShow, setSharingModalShow,
    movementEntryPickerShow, setMovementEntryPickerShow,
    goToPathDialogShow, setGoToPathDialogShow,
    editMode, handleEdit, handleNameSuccess, handleNameFail,
    handleEntryClick, handleEntryDoubleClick,
    handleDirectoryOpen, handleGoFullPath,
    handleFavoriteClick, handleMove, handleDeleteClick,
    handleSelectAll, handleSelectCancel,
    handleNavBack, handleNavForward, handleNavRefresh, handleNavAbort, handleNavToParent,
    handleUploadClick, handleDownloadClick, handleContextMenu,
  } = useWorkArea({
    isUserDesktop: false,
    isTopWindow,
    asEntryPicker,
    specifiedPath: additionalEntryList?.length ? getEntryPath(additionalEntryList[0]) : '',
    onCurrentPathChange,
    onPick,
    onPickDoubleConfirm,
    onOpenDesktopDirectory: () => {},
  })

  useEffect(() => {
    setWindowTitle(currentPath.split('/').pop() as string)
  }, [currentPath, setWindowTitle])

  return (
    <>
      <div className={`absolute inset-0 flex ${asEntryPicker ? '' : 'border-t border-gray-100 dark:border-zinc-700'}`}>
        <Side
          {...{ sideCollapse, currentPath, rootEntryList }}
          onRootEntryClick={(entry) => handleDirectoryOpen(entry, true)}
          onFavoriteCancel={handleFavoriteClick}
        />
        <div className="relative flex-grow h-full bg-white dark:bg-zinc-800 flex flex-col">
          <ControlBar
            {...{
              windowWidth,
              disabledMap,
              gridMode,
              filterMode,
              filterText,
              hiddenShow,
              sortType,
              setFilterMode,
              setFilterText,
            }}
            onHiddenShowChange={handleHiddenShowChange}
            onGridModeChange={handleGridModeChange}
            onSortTypeChange={handleSortChange}
            onSideBarClick={handleSideCollapseChange}
            onNavBack={handleNavBack}
            onNavForward={handleNavForward}
            onNavRefresh={handleNavRefresh}
            onNavAbort={handleNavAbort}
            onNavToParent={handleNavToParent}
            onEdit={handleEdit}
            onUpload={handleUploadClick}
            onDownload={handleDownloadClick}
            onDelete={handleDeleteClick}
            onSelectAll={handleSelectAll}
          />
          <div
            ref={containerRef}
            className="gagu-entry-list-container relative flex-grow overflow-x-hidden overflow-y-auto select-none"
            onMouseDownCapture={handleSelectCancel}
          >
            <div
              ref={lassoRef}
              className="gagu-work-area-lasso"
            />

            <EmptyPanel show={!querying && isEntryListEmpty} />

            <div
              ref={containerInnerRef}
              className={line(`
                gagu-entry-list-container-inner
                relative min-h-full flex flex-wrap content-start
                ${gridMode ? 'p-2' : 'p-4'}
              `)}
              onContextMenu={handleContextMenu}
            >
              {/* create */}
              {[EditMode.createFolder, EditMode.createText].includes(editMode as CreationType) && (
                <EntryNode
                  inputMode
                  gridMode={gridMode}
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
                      entry,
                      kiloSize,
                      gridMode,
                      inputMode,
                      isSelected,
                      isFavorited,
                      supportThumbnail,
                      thumbScrollWatcher,
                      clipboardState,
                    }}
                    draggable={!inputMode && !asEntryPicker}
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
          <StatusBar
            {...{
              folderCount,
              fileCount,
              currentPath,
              currentRootEntry,
              selectedEntryList,
            }}
            loading={querying}
            onDirClick={handleGoFullPath}
            onRootEntryClick={(entry) => handleDirectoryOpen(entry, true)}
          />
        </div>
      </div>

      <SharingModal
        show={sharingModalShow}
        entryList={sharingEntryList}
        onClose={() => setSharingModalShow(false)}
      />

      <GoToPathDialog
        show={goToPathDialogShow}
        currentPath={currentPath}
        onGo={(path) => {
          handleGoFullPath(path, true)
          setGoToPathDialogShow(false)
        }}
        onCancel={() => setGoToPathDialogShow(false)}
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
