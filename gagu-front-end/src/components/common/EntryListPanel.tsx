import { useMemo, useState } from 'react'
import { IEntry } from '../../types'
import { getReadableSize } from '../../utils'
import { useTranslation } from 'react-i18next'
import EntryNode from '../../apps/FileExplorer/EntryNode'
import { useUserConfig } from '../../hooks'

interface EntryListPanelProps {
  downloadName: string
  entryList: IEntry[]
  flatList: IEntry[]
}

export function EntryListPanel(props: EntryListPanelProps) {

  const {
    downloadName,
    entryList,
    flatList,
  } = props

  const { t } = useTranslation()

  const { userConfig: { kiloSize } } = useUserConfig()

  const [allMode, setAllMode] = useState(false)

  const hasFolder = useMemo(() => {
    return entryList?.some(e => e.type === 'directory')
  }, [entryList])
  
  return (
    <>
      <div className="my-6 backdrop-blur border border-gray-200 dark:border-zinc-600">
        <div className="px-3 py-2 text-xs bg-white bg-opacity-50 border-b border-gray-200 font-din flex justify-between items-center dark:bg-black dark:bg-opacity-10 dark:border-zinc-600">
          <span>
            <span className="text-gray-600 dark:text-zinc-200">{downloadName || 'Unknown'}</span>
            <span className="text-gray-400 dark:text-zinc-400">
              &emsp;{
                getReadableSize(
                  flatList.map(e => e.size)
                    .filter(Boolean)
                    .reduce((a, b) => a! + b!, 0) as number,
                  kiloSize,
                )
              }
            </span>
          </span>
          {hasFolder && (
            <span
              className="text-xs text-blue-500 cursor-pointer font-bold select-none"
              onClick={() => setAllMode(!allMode)}
            >
              {allMode ? t`action.showRootDirectory` : t('action.showAllFiles', { count: flatList.length })}
            </span>
          )}
        </div>
        <div className="max-h-[40vh] md:max-h-[50vh] overflow-x-hidden overflow-y-auto">
          <div className="py-3 md:py-6 grid grid-cols-3 md:grid-cols-4 gap-1 md:gap-3 bg-opacity-40">
            {(allMode ? flatList : entryList).map((entry: IEntry) => (
              <EntryNode
                key={entry.parentPath + entry.name}
                hideAppIcon
                gridMode
                entry={entry}
                kiloSize={kiloSize}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
