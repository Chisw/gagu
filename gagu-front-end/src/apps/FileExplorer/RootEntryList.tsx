import RemixIcon from '../../img/remixicon'
import { getBytesSize, line } from '../../utils'
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
        {rootEntryList.map(({ name, mounted, spaceFree, spaceTotal, isVolume }) => {
          const isActive = mounted === activeRootEntryMounted
          const canRootEntryClick = currentDirPath !== mounted
          const spaceUsed = isVolume ? spaceTotal! - spaceFree! : 0
          return (
            <div
              key={mounted}
              title={name}
              className={line(`
                mb-2 p-2 text-xs rounded cursor-pointer
                ${isActive
                  ? 'bg-gray-200 text-black'
                  : 'text-gray-500 hover:text-black'
                }
              `)}
              onClick={() => canRootEntryClick && onRootEntryClick(mounted)}
            >
              <div className="flex items-center">
                {isVolume ? <RemixIcon.HardDrive /> : <RemixIcon.Folder />}
                <span className="ml-1 truncate flex-grow">{name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="transform scale-75 origin-left">
                  {mounted}
                </span>
                {isVolume && (
                  <span className="transform scale-75 origin-right font-din text-gray-500">
                    {`${getBytesSize({ bytes: spaceUsed })}/${getBytesSize({ bytes: spaceTotal! })}`.replace(/\s/g, '')}
                  </span>
                )}
              </div>
              {isVolume && (
                <div className="relative mt-1 h-1 text-gray-500 font-din bg-white rounded-sm overflow-hidden">
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