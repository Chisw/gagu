import { useMemo, useState } from 'react'
import { IEntry } from '../types'
import { getReadableSize } from '../utils'
import { useTranslation } from 'react-i18next'
import EntryNode from '../apps/FileExplorer/EntryNode'

interface EntryListPanelProps {
  downloadName: string
  entryList: IEntry[]
  flattenList: IEntry[]
}

export default function EntryListPanel(props: EntryListPanelProps) {

  const {
    downloadName,
    entryList,
    flattenList,
  } = props

  const { t } = useTranslation()

  const [allMode, setAllMode] = useState(false)

  const hasFolder = useMemo(() => {
    return entryList?.some(e => e.type === 'directory')
  }, [entryList])
  
  return (
    <>
      <div className="my-6 backdrop-filter backdrop-blur border border-gray-200">
        <div className="px-3 py-2 text-xs bg-white bg-opacity-50 border-b border-gray-200 font-din flex justify-between items-center">
          <span>
            <span className="text-gray-600">{downloadName || 'Unknown'}</span>
            <span className="text-gray-400">
              &emsp;{getReadableSize(flattenList.map(e => e.size).filter(Boolean).reduce((a, b) => a! + b!, 0) as number)}
            </span>
          </span>
          {hasFolder && (
            <span
              className="text-xs text-blue-500 cursor-pointer font-bold select-none"
              onClick={() => setAllMode(!allMode)}
            >
              {allMode ? t`action.showRootDirectory` : t('action.showAllFiles', { count: flattenList.length })}
            </span>
          )}
        </div>
        <div className="max-h-[50vh] overflow-x-hidden overflow-y-auto">
          <div className="px-4 md:px-8 py-3 md:py-6 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 bg-opacity-40">
            {(allMode ? flattenList : entryList).map((entry: IEntry) => (
              <EntryNode
                key={entry.parentPath + entry.name}
                hideAppIcon
                gridMode
                entry={entry}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
