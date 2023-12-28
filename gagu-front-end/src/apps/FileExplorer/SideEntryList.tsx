import { IconButton, SvgIcon } from '../../components/common'
import { IRootEntry, RootEntryGroup } from '../../types'
import { getReadableSize, getEntryPath, line } from '../../utils'
import { useDragDrop, useUserConfig } from '../../hooks'

interface SideEntryListProps {
  currentPath: string
  rootEntryList: IRootEntry[]
  onRootEntryClick: (rootEntry: IRootEntry) => void
  onFavoriteCancel: (rootEntry: IRootEntry) => void
}

export default function SideEntryList(props: SideEntryListProps) {

  const {
    currentPath,
    rootEntryList,
    onRootEntryClick,
    onFavoriteCancel,
  } = props

  const { userConfig: { kiloSize } } = useUserConfig()

  const dragDropProps = useDragDrop({
    onOpen: (path) => {
      const rootEntry = rootEntryList.find(entry => getEntryPath(entry) === path)
      rootEntry && onRootEntryClick(rootEntry)
    }
  })

  return (
    <>
      {rootEntryList.map((rootEntry) => {
        const { spaceFree, spaceTotal, name, group, isDisk = false } = rootEntry
        const rootEntryPath = getEntryPath(rootEntry)
        const isActive = rootEntryPath === currentPath
        const canRootEntryClick = currentPath !== rootEntryPath
        const spaceUsed = isDisk ? spaceTotal! - spaceFree! : 0

        return (
          <div
            key={rootEntryPath}
            {...dragDropProps}
            data-is-drag-drop-node={isActive ? 'false' : 'true'}
            data-entry-path={rootEntryPath}
            className={line(`
              gagu-file-explorer-side-entry
              relative px-3 py-3 md:py-2 text-sm border-l-4
              transition-all duration-200
              ${isActive
                ? 'border-blue-500 bg-white text-black dark:bg-zinc-800 dark:text-zinc-200'
                : 'border-transparent text-gray-600 hover:text-black cursor-pointer dark:text-zinc-200 dark:hover:text-white'
              }
            `)}
            onClick={() => canRootEntryClick && onRootEntryClick(rootEntry)}
          >
            <div className="flex justify-between items-center">
              <div className="flex-shrink-0">
                {rootEntry.group === RootEntryGroup.user
                  ? <SvgIcon.FolderUser />
                  : isDisk
                    ? <SvgIcon.HardDrive />
                    : <SvgIcon.Folder />
                }
              </div>
              <div
                className="ml-1 truncate flex-grow"
                title={name}
              >
                {name}
              </div>
              {isDisk && (
                <div className="flex-shrink-0 font-din scale-75 origin-right opacity-60">
                  {`${getReadableSize(spaceUsed!, kiloSize)} / ${getReadableSize(spaceTotal!, kiloSize)}`}
                </div>
              )}
              {group === RootEntryGroup.favorite && (
                <div onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    size="xs"
                    className="hover:outline-2 hover:outline-dashed hover:outline-yellow-400"
                    icon={<SvgIcon.StarSolid size={10} className="text-yellow-500" />}
                    onClick={() => onFavoriteCancel(rootEntry)}
                  />
                </div>
              )}
            </div>
            {isDisk && (
              <div className="mt-[2px] text-xs relative z-0 h-[2px] font-din bg-blue-100 rounded-sm overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${spaceUsed / spaceTotal! * 100}%` }}
                />
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
