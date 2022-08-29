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
              title={name}
              className={line(`
                mb-1 p-2 text-xs rounded-sm cursor-pointer
                ${isActive
                  ? 'bg-white text-black'
                  : 'text-gray-500 hover:text-black'
                }
              `)}
              onClick={() => canRootEntryClick && onRootEntryClick(rootEntry)}
            >
              <div className="flex items-center">
                {isDisk ? <SvgIcon.HardDrive /> : <SvgIcon.Folder />}
                <span className="ml-1 truncate flex-grow">{label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs transform scale-75 origin-left">{rootEntryPath}</span>
                {isDisk && (
                  <span className="transform scale-75 origin-right font-din">
                    {`${getReadableSize(spaceUsed!)}/${getReadableSize(spaceTotal!)}`.replace(/\s/g, '')}
                  </span>
                )}
              </div>
              {isDisk && (
                <div className="relative h-2px font-din bg-white rounded-sm overflow-hidden shadow">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-blue-500"
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