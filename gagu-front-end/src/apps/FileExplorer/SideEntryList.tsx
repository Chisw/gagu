import { IconButton, SvgIcon } from '../../components/common'
import { ISideEntry } from '../../types'
import { getReadableSize, getEntryPath, line } from '../../utils'
import { useDragDrop, useUserConfig } from '../../hooks'

interface SideEntryListProps {
  currentPath: string
  sideEntryList: ISideEntry[]
  onSideEntryClick: (sideEntry: ISideEntry) => void
  onFavoriteCancel: (sideEntry: ISideEntry) => void
}

export default function SideEntryList(props: SideEntryListProps) {

  const {
    currentPath,
    sideEntryList,
    onSideEntryClick,
    onFavoriteCancel,
  } = props

  const { userConfig: { kiloSize } } = useUserConfig()

  const dragDropProps = useDragDrop({
    onOpen: (path) => {
      const sideEntry = sideEntryList.find(entry => getEntryPath(entry) === path)
      sideEntry && onSideEntryClick(sideEntry)
    }
  })

  return (
    <>
      {sideEntryList.map((sideEntry, sideEntryIndex) => {
        const { spaceFree, spaceTotal, name, isDisk = false, isFavorited = false } = sideEntry
        const sideEntryPath = getEntryPath(sideEntry)
        const isActive = sideEntryPath === currentPath
        const canSideEntryClick = currentPath !== sideEntryPath
        const spaceUsed = isDisk ? spaceTotal! - spaceFree! : 0
        const isPersonal = sideEntryIndex === 0

        return (
          <div
            key={sideEntryPath}
            {...dragDropProps}
            data-is-drag-drop-node={isActive ? 'false' : 'true'}
            data-entry-path={sideEntryPath}
            className={line(`
              gagu-file-explorer-side-entry
              relative px-3 py-3 md:py-2 text-sm border-l-4
              transition-all duration-200
              ${isActive
                ? 'border-blue-500 bg-white text-black'
                : 'border-transparent text-gray-600 hover:text-black cursor-pointer'
              }
            `)}
            onClick={() => canSideEntryClick && onSideEntryClick(sideEntry)}
          >
            <div className="flex justify-between items-center">
              <div className="flex-shrink-0">
                {isPersonal
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
              {isFavorited && (
                <div onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    size="xs"
                    className="hover:outline-2 hover:outline-dashed hover:outline-yellow-400"
                    icon={<SvgIcon.StarSolid size={10} className="text-yellow-500" />}
                    onClick={() => onFavoriteCancel(sideEntry)}
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
