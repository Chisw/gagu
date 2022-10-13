import { Tooltip } from '@douyinfe/semi-ui'
import { SvgIcon } from '../../components/base'
import { IRootEntry } from '../../types'
import { getReadableSize, getEntryPath, line } from '../../utils'

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
          const { spaceFree, spaceTotal, label, isDisk } = rootEntry
          const rootEntryPath = getEntryPath(rootEntry)
          const isActive = rootEntryPath === getEntryPath(activeRootEntry)
          const canRootEntryClick = currentPath !== rootEntryPath
          const spaceUsed = isDisk ? spaceTotal! - spaceFree! : 0
          return (
            <div
              key={rootEntryPath}
              className={line(`
                p-2 text-sm cursor-pointer
                ${isActive
                  ? 'bg-white text-black'
                  : 'bg-w hite-400 text-gray-500 hover:text-black'
                }
              `)}
              onClick={() => canRootEntryClick && onRootEntryClick(rootEntry)}
            >
              <div className="flex justify-between items-center group">
                <div className="flex items-center">
                  {isDisk ? <SvgIcon.HardDrive /> : <SvgIcon.Folder />}
                  <span className="ml-1 truncate flex-grow">{label}</span>
                </div>
                <div className="hidden group-hover:block text-gray-400 cursor-default">
                  <Tooltip
                    position="topRight"
                    content={(
                      <span className="text-xs font-din">
                        {rootEntryPath}
                      </span>
                    )}
                  >
                    <span>
                      <SvgIcon.Info />
                    </span>
                  </Tooltip>
                </div>
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