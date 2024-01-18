import { useRecoilState } from 'recoil'
import { clipboardDataState } from '../states'
import { line } from '../utils'
import { ClipboardType, EntryType, IEntry } from '../types'
import { SvgIcon } from './common'
import EntryNode from '../apps/FileExplorer/EntryNode'
import { useUserConfig } from '../hooks'
import { useState } from 'react'

export default function Clipboard() {
  const { userConfig: { kiloSize } } = useUserConfig()

  const [clipboardData] = useRecoilState(clipboardDataState)

  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <>
      <div>
        {clipboardData.map(({ type, entryList }, itemIndex) => {
          const isCopy = type === ClipboardType.copy
          const folderCount = entryList.filter(entry => entry.type === EntryType.directory).length
          const fileCount = entryList.filter(entry => entry.type === EntryType.file).length

          return (
            <div
              key={itemIndex}
              className="mb-3 rounded bg-white overflow-hidden"
            >
              <div className="flex items-center">
                <div
                  className={line(`
                    p-2 w-8 h-full border-r flex justify-center items-center text-zinc-500
                  `)}
                >
                  {isCopy ? <SvgIcon.Copy /> : <SvgIcon.Cut />}
                </div>
                <div className="p-2 flex-grow flex items-center text-zinc-400 text-xs">
                  {!!folderCount && (
                    <div className="mr-2 flex items-center">
                      <SvgIcon.Folder />
                      <span className="ml-1">{folderCount}</span>
                    </div>
                  )}

                  {!!fileCount && (
                    <div className="mr-2 flex items-center">
                      <SvgIcon.File />
                      <span className="ml-1">{fileCount}</span>
                    </div>
                  )}
                </div>
                <div
                  className="p-2 w-8 h-full cursor-pointer hover:bg-gray-100 flex justify-center"
                  onClick={() => setActiveIndex(itemIndex)}
                >
                  <SvgIcon.Add />
                </div>
              </div>
              <div
                className={line(`
                  overflow-y-auto
                  transition-all duration-200
                  ${itemIndex === activeIndex ? 'max-h-64 border-t' : 'max-h-0' }
                `)}
              >
                <div className="py-2">
                  {entryList.map((entry: IEntry) => (
                    <EntryNode
                      key={entry.parentPath + entry.name}
                      hideAppIcon
                      gridMode={false}
                      entry={entry}
                      kiloSize={kiloSize}
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
