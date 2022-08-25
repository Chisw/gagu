import { SvgIcon } from '../../components/base'
import { getReadableSize, line } from '../../utils'
import { IRootEntry } from '../../utils/types'

interface RootEntryListProps {
  currentPath: string
  activeRootEntryMounted: string
  rootEntryList: IRootEntry[]
  onRootEntryClick: (mounted: string) => void
}

export default function RootEntryList(props: RootEntryListProps) {

  const {
    currentPath,
    activeRootEntryMounted,
    rootEntryList,
    onRootEntryClick,
  } = props

  return (
    <>
      <div>
        {rootEntryList.map(({ name, parentPath, spaceFree, spaceTotal, label, isDisk }) => {
          const mounted = `${parentPath}/${name}`
          const isActive = mounted === activeRootEntryMounted
          const canRootEntryClick = currentPath !== mounted
          const spaceUsed = isDisk ? spaceTotal! - spaceFree! : 0
          const path = `${parentPath}/${name}`
          return (
            <div
              key={mounted}
              title={name}
              className={line(`
                mb-1 p-2 text-xs rounded-sm cursor-pointer
                ${isActive
                  ? 'bg-white text-black shadow'
                  : 'text-gray-500 hover:text-black'
                }
              `)}
              onClick={() => canRootEntryClick && onRootEntryClick(mounted)}
            >
              <div className="flex items-center">
                {isDisk ? <SvgIcon.HardDrive /> : <SvgIcon.Folder />}
                <span className="ml-1 truncate flex-grow">{label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs transform scale-75 origin-left">{path}</span>
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