import { useCallback, useState } from 'react'
import { useRecoilState } from 'recoil'
import { clipboardDataState } from '../states'
import { line } from '../utils'
import { ClipboardType, EntryType, IEntry } from '../types'
import { SvgIcon } from './common'
import EntryNode from '../apps/FileExplorer/EntryNode'
import { useUserConfig } from '../hooks'

export function ClipboardList() {
  const { userConfig: { kiloSize } } = useUserConfig()

  const [clipboardData, setClipboardData] = useRecoilState(clipboardDataState)

  const handleRemove = useCallback((index: number) => {
    const list = [...clipboardData]
    list.splice(index, 1)
    setClipboardData(list)
  }, [clipboardData, setClipboardData])

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
              className="mb-3 rounded bg-white bg-opacity-80 overflow-hidden"
            >
              <div className="h-8 flex items-center">
                <div
                  className={line(`
                    w-8 h-full border-r text-zinc-500
                    flex justify-center items-center
                  `)}
                >
                  {isCopy ? <SvgIcon.Copy /> : <SvgIcon.Cut />}
                </div>
                <div className="px-2 flex-grow flex items-center text-zinc-500 text-xs">
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
                  className={line(`
                    flex justify-center
                    p-2 w-8 h-full cursor-pointer
                    bg-opacity-5 hover:bg-white active:bg-black active:bg-opacity-5
                  `)}
                  onClick={() => handleRemove(itemIndex)}
                >
                  <SvgIcon.Remove className="text-red-500" />
                </div>
                {/* <div
                  className={line(`
                    flex justify-center
                    p-2 w-8 h-full cursor-pointer
                    bg-opacity-5 hover:bg-white active:bg-black active:bg-opacity-5
                  `)}
                  onClick={() => setActiveIndex(isActive ? -1 : itemIndex)}
                >
                  {isActive ? <SvgIcon.ChevronTop /> : <SvgIcon.ChevronBottom />}
                </div> */}
              </div>
              <div
                className={line(`
                  overflow-y-auto
                  transition-all duration-200
                  ${true ? 'max-h-64 border-t' : 'max-h-0' }
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
