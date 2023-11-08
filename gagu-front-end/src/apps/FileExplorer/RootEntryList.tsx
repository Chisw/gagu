import { SvgIcon } from '../../components/base'
import { IRootEntry } from '../../types'
import { getReadableSize, getEntryPath, line } from '../../utils'

interface RootEntryListProps {
  currentPath: string
  rootEntryList: IRootEntry[]
  onRootEntryClick: (rootEntry: IRootEntry) => void
}

export default function RootEntryList(props: RootEntryListProps) {

  const {
    currentPath,
    rootEntryList,
    onRootEntryClick,
  } = props

  return (
    <>
      <div>
        {rootEntryList.map(rootEntry => {
          const { spaceFree, spaceTotal, name, isDisk } = rootEntry
          const rootEntryPath = getEntryPath(rootEntry)
          const isActive = rootEntryPath === currentPath
          const canRootEntryClick = currentPath !== rootEntryPath
          const spaceUsed = isDisk ? spaceTotal! - spaceFree! : 0
          return (
            <div
              key={rootEntryPath}
              className={line(`
                px-3 py-2 text-sm cursor-pointer
                ${isActive
                  ? 'bg-white text-black'
                  : 'text-gray-700 hover:text-black'
                }
              `)}
              onClick={() => canRootEntryClick && onRootEntryClick(rootEntry)}
            >
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  {isDisk ? <SvgIcon.HardDrive /> : <SvgIcon.Folder />}
                  <span className="ml-1 truncate flex-grow">{name}</span>
                </span>
                {isDisk && (
                  <div className="font-din scale-75 origin-right opacity-60">
                    {`${getReadableSize(spaceUsed!)} / ${getReadableSize(spaceTotal!)}`}
                  </div>
                )}
              </div>
              {isDisk && (
                <div className="mt-[2px] text-xs relative z-0 h-1 font-din bg-gray-100 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${spaceUsed / spaceTotal! * 100}%` }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}