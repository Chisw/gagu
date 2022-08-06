import { getFileNameExtension, line } from '../../utils'
import Icon from './Icon'
import { NameLabel } from './NameLine'

interface VirtualEntriesProps {
  virtualEntries: File[]
  gridMode: boolean
}

export default function VirtualEntries(props: VirtualEntriesProps) {

 const {
   virtualEntries,
   gridMode,
 } = props

  return (
    <>
      {Array.from(virtualEntries).map(({ name }) => (
        <div
          key={encodeURIComponent(name)}
          data-name={name}
          className={line(`
            opacity-60 bg-loading
            overflow-hidden rounded select-none hover:bg-gray-100
            ${gridMode ? 'm-2 px-1 py-3 w-28' : 'mb-1 px-2 py-1 w-full flex items-center'}
          `)}
        >
          <Icon
            virtual
            small={!gridMode}
            entry={{ name, type: 'file', parentPath: '', extension: getFileNameExtension(name) }}
          />
          <div className={`${gridMode ? 'mt-2 text-center' : 'ml-4 flex justify-center items-center'}`}>
            <NameLabel
              entryName={name}
              gridMode={gridMode}
            />
          </div>
        </div>
      ))}
    </>
  )
}