import { SvgIcon } from '../../components/base'
import { IRootEntry } from '../../types'
import { getReadableSize, getRootEntryPath, line } from '../../utils'

interface RootEntryListProps {
  currentPath: string
  activeRootEntry: IRootEntry | null
  rootEntryList: IRootEntry[]
  onRootEntryClick: (rootEntry: IRootEntry) => void
}

export default function RootEntryList(props: RootEntryListProps) {

  const {
    currentPath,
    activeRootEntry,
    rootEntryList,
    onRootEntryClick,
  } = props

  return (
    <>
      <div>
        {rootEntryList.map(rootEntry => {
          const { name, spaceFree, spaceTotal, label, isDisk } = rootEntry
          const rootEntryPath = getRootEntryPath(rootEntry)
          const isActive = rootEntryPath === getRootEntryPath(activeRootEntry)
          const canRootEntryClick = currentPath !== rootEntryPath
          const spaceUsed = isDisk ? spaceTotal! - spaceFree! : 0
          return (
            <div
              key={rootEntryPath}
              title={label || name}
              className={line(`
                mb-2 p-2 text-sm rounded-sm cursor-pointer
                ${isActive
                  ? 'bg-white text-black'
                  : 'bg-white-400 text-gray-500 hover:text-black'
                }
              `)}
              onClick={() => canRootEntryClick && onRootEntryClick(rootEntry)}
            >
              <div className="flex items-center">
                {isDisk ? <SvgIcon.HardDrive /> : <SvgIcon.Folder />}
                <span className="ml-1 truncate flex-grow">{label}</span>
              </div>
              <div className="break-word transform scale-90 origin-left opacity-60 font-din text-xs">
                {rootEntryPath}
              </div>
              {isDisk && (
                <div className="mt-2px text-xs">
                  <div className="relative z-0 h-1 font-din bg-gray-100 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${spaceUsed / spaceTotal! * 100}%` }}
                    />
                  </div>
                  <div className="font-din transform scale-90 origin-left opacity-60">
                    {`${getReadableSize(spaceUsed!)} / ${getReadableSize(spaceTotal!)}`}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}