import { SvgIcon } from '../../components/base'
import { getReadableSize, line } from '../../utils'
import { IRootEntry } from '../../utils/types'

interface RootEntryListProps {
  currentDirPath: string
  activeRootEntryMounted: string
  rootEntryList: IRootEntry[]
  onRootEntryClick: (mounted: string) => void
}

export default function RootEntryList(props: RootEntryListProps) {

  const {
    currentDirPath,
    activeRootEntryMounted,
    rootEntryList,
    onRootEntryClick,
  } = props

  return (
    <>
      <div>
        {rootEntryList.map(({ name, mounted, spaceFree, spaceTotal, isDisk }) => {
          const isActive = mounted === activeRootEntryMounted
          const canRootEntryClick = currentDirPath !== mounted
          const spaceUsed = isDisk ? spaceTotal! - spaceFree! : 0
          return (
            <div
              key={mounted}
              title={name}
              className={line(`
                px-2 py-1 text-xs rounded cursor-pointer
                ${isActive
                  ? 'bg-white text-black shadow'
                  : 'text-gray-500 hover:text-black'
                }
              `)}
              onClick={() => canRootEntryClick && onRootEntryClick(mounted)}
            >
              <div className="flex items-center">
                {isDisk ? <SvgIcon.HardDrive /> : <SvgIcon.Folder />}
                <span className="ml-1 truncate flex-grow">{name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="transform scale-75 origin-left">
                  {mounted}
                </span>
                {isDisk && (
                  <span className="transform scale-75 origin-right font-din">
                    {`${getReadableSize(spaceUsed!)}/${getReadableSize(spaceTotal!)}`.replace(/\s/g, '')}
                  </span>
                )}
              </div>
              {isDisk && (
                <div className="relative h-2px font-din bg-white rounded-sm overflow-hidden">
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