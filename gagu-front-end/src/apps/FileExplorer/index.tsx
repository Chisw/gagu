import { useEffect, useState } from 'react'
import { SharingModal } from '../../components'
import { useWorkArea } from '../../hooks'
import StatusBar from './StatusBar'
import ControlBar from './ControlBar'
import Side from './Side'
import { EmptyPanel } from '../../components/common'
import { getEntryPath, getIsSameEntry, line } from '../../utils'
import { FileExplorerProps, EditMode, CreationType } from '../../types'
import EntryNode from './EntryNode'

export default function FileExplorer(props: FileExplorerProps) {

  const {
    isTopWindow,
    windowSize: { width: windowWidth },
    setWindowTitle,
    addtionalEntryList,
    asSelector = false,
    onCurrentPathChange = () => {},
    onSelect = () => {},
    onSelectDoubleConfirm = () => {},
  } = props

  const [sideCollapse, setSideCollapse] = useState(false)

  const {
    lassoRef, containerRef, containerInnerRef,
    supportThumbnail, thumbScrollWatcher,
    currentPath, activeRootEntry,
    entryList, selectedEntryList,
    favoriteEntryList, sideEntryList, sharingEntryList,
    isEntryListEmpty, disabledMap,
    folderCount, fileCount,
    querying, sizeQuerying, deleting,
    filterMode, setFilterMode,
    filterText, setFilterText,
    hiddenShow, handleHiddenShowChange,
    gridMode, handleGridModeChange,
    sortType, handleSortChange,
    sharingModalShow, setSharingModalShow,
    editMode, handleEdit, handleNameSuccess, handleNameFail,
    handleEntryClick, handleEntryDoubleClick,
    handleDirectoryOpen, handleGoFullPath,
    handleFavoriteClick, handleDeleteClick,
    handleSelectAll, handleSelectCancel,
    handleNavBack, handleNavForward, handleNavRefresh, handleNavAbort, handleNavToParent,
    handleUploadClick, handleDownloadClick, handleContextMenu,
  } = useWorkArea({
    isUserDesktop: false,
    isTopWindow,
    asSelector,
    specifiedPath: addtionalEntryList?.length ? getEntryPath(addtionalEntryList[0]) : '',
    onCurrentPathChange,
    onSelect,
    onSelectDoubleConfirm,
    onOpenDesktopDirectory: () => {},
  })

  useEffect(() => {
    setWindowTitle(currentPath.split('/').pop() as string)
  }, [currentPath, setWindowTitle])

  return (
    <>
      <div className={`absolute inset-0 flex ${asSelector ? '' : 'border-t border-gray-100'}`}>
        {/* side */}
        <Side
          {...{ sideCollapse, currentPath, sideEntryList }}
          onSideEntryClick={(entry) => handleDirectoryOpen(entry, true)}
          onFavoriteCancel={(entry) => handleFavoriteClick(entry, true)}
        />
        {/* main */}
        <div className="relative flex-grow h-full bg-white flex flex-col">
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
            onSideBarClick={() => setSideCollapse(!sideCollapse)}
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
              className="hidden absolute z-10 border box-content border-gray-400 bg-black bg-opacity-10 pointer-events-none"
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
                  creationType={editMode as CreationType}
                  onNameSuccess={handleNameSuccess}
                  onNameFail={handleNameFail}
                />
              )}

              {/* entry list */}
              {entryList.map(entry => {
                const isSelected = selectedEntryList.some(o => getIsSameEntry(o, entry))
                const isFavorited = favoriteEntryList.some(o => getIsSameEntry(o, entry))
                const inputMode = editMode === EditMode.rename && isSelected
                return (
                  <EntryNode
                    key={encodeURIComponent(`${entry.name}-${entry.type}`)}
                    {...{
                      entry,
                      gridMode,
                      inputMode,
                      isSelected,
                      isFavorited,
                      supportThumbnail,
                      thumbScrollWatcher,
                    }}
                    draggable={!inputMode && !asSelector}
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
              selectedEntryList,
            }}
            loading={querying}
            rootEntry={activeRootEntry}
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

    </>
  )
}
