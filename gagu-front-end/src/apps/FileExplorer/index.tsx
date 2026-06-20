import { Fragment, useEffect, useMemo } from 'react'
import { EntryPicker, SharingModal } from '../../components'
import { useWorkArea } from '../../hooks'
import StatusBar from './StatusBar'
import ControlBar from './ControlBar'
import Side from './Side'
import { EmptyPanel } from '../../components/common'
import { getBoundStyle, getIsSameEntry, line, getEntryBound } from '../../utils'
import { FileExplorerProps, EditMode, CreationType, AppId, ClipboardState } from '../../types'
import { EntryType, getEntryPath } from '@shared'
import EntryNode from './EntryNode'
import GoToPathDialog from './GoToPathDialog'
import { useTranslation } from 'react-i18next'
import { useVirtualizer } from '@tanstack/react-virtual'

export default function FileExplorer(props: FileExplorerProps) {

  const {
    isTopWindow,
    appWindowSize: { width: appWindowWidth },
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
    virtualContainer, virtualBox,
    supportThumbnail,
    currentPath, currentRootEntry,
    boundedEntryList, selectedEntryList,
    favoriteRootEntryList, rootEntryList, sharingEntryList,
    isEntryListEmpty, disabledMap,
    folderCount, fileCount,
    querying, sizeQuerying, deleting,
    filterMode, setFilterMode,
    filterText, setFilterText,
    sideCollapse, handleSideCollapseChange,
    hiddenVisible, handleHiddenShowChange,
    gridMode, handleGridModeChange,
    sortType, handleSortChange,
    sharingModalShow, setSharingModalShow,
    movementEntryPickerShow, setMovementEntryPickerShow,
    goToPathDialogShow, setGoToPathDialogShow,
    editMode, handleNameSuccess, handleNameFail,
    handleEntryClick, handleEntryDoubleClick,
    handleDirectoryOpen, handleGoFullPath,
    handleFavoriteClick, handleMove,
    handleSelectCancel,
    handleNavBack, handleNavForward, handleNavRefresh, handleNavAbort, handleNavToParent,
    handleContextMenu,
  } = useWorkArea({
    isUserDesktop: false,
    isTopWindow,
    appWindowWidth,
    asEntryPicker,
    specifiedPath: additionalEntryList?.length ? getEntryPath(additionalEntryList[0]) : '',
    onCurrentPathChange,
    onPick,
    onPickDoubleConfirm,
    onOpenDesktopDirectory: () => {},
  })

  const isCreating = useMemo(() => {
    return [EditMode.createFolder, EditMode.createText].includes(editMode as CreationType)
  }, [editMode])

  const virtualizer = useVirtualizer({
    count: virtualContainer.rows + (isCreating ? 1 : 0),
    getScrollElement: () => containerRef.current,
    estimateSize: () => virtualBox.height + virtualBox.marginY,
    overscan: 3,
  })

  useEffect(() => {
    setWindowTitle(currentPath.split('/').pop() as string)
  }, [currentPath, setWindowTitle])

  return (
    <>
      <div className={`absolute inset-0 flex ${asEntryPicker ? '' : 'border-t border-gray-100 dark:border-zinc-700'}`}>
        <Side
          sideCollapse={sideCollapse}
          currentPath={currentPath}
          rootEntryList={rootEntryList}
          onRootEntryClick={(entry) => handleDirectoryOpen(entry, true)}
          onFavoriteCancel={handleFavoriteClick}
        />
        <div className="relative grow h-full bg-white dark:bg-zinc-800 flex flex-col">
          <ControlBar
            appWindowWidth={appWindowWidth}
            disabledMap={disabledMap}
            gridMode={gridMode}
            filterMode={filterMode}
            filterText={filterText}
            hiddenVisible={hiddenVisible}
            sortType={sortType}
            setFilterMode={setFilterMode}
            setFilterText={setFilterText}
            onHiddenShowChange={handleHiddenShowChange}
            onGridModeChange={handleGridModeChange}
            onSortTypeChange={handleSortChange}
            onSideBarClick={handleSideCollapseChange}
            onNavBack={handleNavBack}
            onNavForward={handleNavForward}
            onNavRefresh={handleNavRefresh}
            onNavAbort={handleNavAbort}
            onNavToParent={handleNavToParent}
          />
          <div
            ref={containerRef}
            className="gagu-entry-list-container relative grow overflow-x-hidden overflow-y-auto select-none"
            onMouseDownCapture={handleSelectCancel}
          >
            <div
              ref={lassoRef}
              className="gagu-work-area-lasso"
            />

            <EmptyPanel visible={!querying && isEntryListEmpty} />

            <div
              ref={containerInnerRef}
              className={line(`
                gagu-entry-list-container-inner
                relative z-0 min-h-full
              `)}
              style={{ height: virtualizer.getTotalSize() + virtualBox.marginY + virtualContainer.padding * 2 }}
              onContextMenu={handleContextMenu}
            >
              {/* entry list */}
              {virtualizer.getVirtualItems().map(({ key: rowKey, index: rowIndex }) => {
                const isEven = rowIndex % 2 === 0
                const { cols } = virtualContainer
                const startIndex = rowIndex * cols
                const endIndex = startIndex + cols
                const rowEntries = boundedEntryList.slice(startIndex, endIndex)

                return (
                  <Fragment key={rowKey}>
                    {rowEntries.map((entry) => {
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
                          entry={entry}
                          kiloSize={kiloSize}
                          gridMode={gridMode}
                          style={getBoundStyle(entry.bound)}
                          inputMode={inputMode}
                          isSelected={isSelected}
                          isFavorited={isFavorited}
                          isEven={isEven}
                          supportThumbnail={supportThumbnail}
                          clipboardState={clipboardState}
                          draggable={!inputMode && !asEntryPicker}
                          requestState={{ deleting, sizeQuerying }}
                          onClick={handleEntryClick}
                          onDoubleClick={handleEntryDoubleClick}
                          onNameSuccess={handleNameSuccess}
                          onNameFail={handleNameFail}
                        />
                      )
                    })}
                  </Fragment>
                )
              })}

              {/* create */}
              {isCreating && (
                <EntryNode
                  inputMode
                  gridMode={gridMode}
                  style={getBoundStyle(getEntryBound(boundedEntryList.length, virtualContainer, virtualBox))}
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
            </div>
          </div>
          <StatusBar
            folderCount={folderCount}
            fileCount={fileCount}
            currentPath={currentPath}
            currentRootEntry={currentRootEntry}
            selectedEntryList={selectedEntryList}
            loading={querying}
            onDirClick={handleGoFullPath}
            onRootEntryClick={(entry) => handleDirectoryOpen(entry, true)}
          />
        </div>
      </div>

      <SharingModal
        visible={sharingModalShow}
        entryList={sharingEntryList}
        onClose={() => setSharingModalShow(false)}
      />

      <GoToPathDialog
        visible={goToPathDialogShow}
        currentPath={currentPath}
        onGo={(path) => {
          handleGoFullPath(path, true)
          setGoToPathDialogShow(false)
        }}
        onCancel={() => setGoToPathDialogShow(false)}
      />

      <EntryPicker
        visible={movementEntryPickerShow}
        appId={AppId.fileExplorer}
        mode="open"
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
