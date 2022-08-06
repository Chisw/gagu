import { VmdkDisk16 } from '@carbon/icons-react'
import { getBytesSize, line } from '../../utils'
import { IVolume } from '../../utils/types'

interface VolumeListProps {
  currentDirPath: string
  activeVolume: string
  volumeList: IVolume[]
  onVolumeClick: (mount: string) => void
}

export default function VolumeList(props: VolumeListProps) {

  const {
    currentDirPath,
    activeVolume,
    volumeList,
    onVolumeClick,
  } = props

  return (
    <>
      <div>
        {volumeList.map(({ label, name, mount, spaceFree, spaceTotal }, volumeIndex) => {
          const title = `${name || mount} (${label})`
          const isActive = mount === activeVolume
          const canVolumeClick = currentDirPath !== mount
          const spaceUsed = spaceTotal - spaceFree
          return (
            <div
              key={volumeIndex}
              title={title}
              className={line(`
                mb-2 p-2 text-xs rounded cursor-pointer
                ${isActive
                  ? 'bg-gray-200 text-black'
                  : 'text-gray-500 hover:text-black'
                }
              `)}
              onClick={() => canVolumeClick && onVolumeClick(mount)}
            >
              <div className="flex items-center">
                <VmdkDisk16 className="flex-shrink-0" />
                <span className="ml-1 truncate flex-grow">{title}</span>
                <span className="font-din text-gray-500">
                  {`${getBytesSize({ bytes: spaceUsed })}/${getBytesSize({ bytes: spaceTotal })}`.replace(/\s/g, '')}
                </span>
              </div>
              <div className="relative mt-1 h-1 text-gray-500 font-din bg-white rounded-sm overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 left-0 bg-green-500"
                  style={{ width: `${spaceUsed / spaceTotal * 100}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}