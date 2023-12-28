import { useMemo } from 'react'
import { line } from '../../utils'
import { IRootEntry, RootEntryGroup } from '../../types'
import SideEntryList from './SideEntryList'
import { groupBy } from 'lodash-es'
import { useTranslation } from 'react-i18next'

interface SideProps {
  sideCollapse: boolean
  currentPath: string
  rootEntryList: IRootEntry[]
  onRootEntryClick: (rootEntry: IRootEntry) => void
  onFavoriteCancel: (rootEntry: IRootEntry) => void
}

export default function Side(props: SideProps) {

  const {
    sideCollapse,
    currentPath,
    rootEntryList,
    onRootEntryClick,
    onFavoriteCancel,
  } = props

  const { t } = useTranslation()

  const groupMap = useMemo(() => {
    return groupBy(rootEntryList, 'group') as {
      [RootEntryGroup.user]: IRootEntry[] | undefined,
      [RootEntryGroup.system]: IRootEntry[] | undefined,
      [RootEntryGroup.favorite]: IRootEntry[] | undefined,
    }
  }, [rootEntryList])
  
  return (
    <div
      className={line(`
        relative flex-shrink-0 h-full transition-all duration-300 select-none overflow-hidden
        ${sideCollapse ? 'w-0' : 'w-56'}
      `)}
    >
      <div
        className={line(`
          w-56 h-full border-r border-gray-100
          overflow-x-hidden overflow-y-auto
          dark:border-zinc-700
        `)}
      >
        {[
          { key: 'user', list: groupMap.user },
          { key: 'system', list: groupMap.system },
          { key: 'favorite', list: groupMap.favorite },
        ].map(({ key, list }) => (
          <div
            key={key}
            className={line(`
              mt-3
              ${list?.length ? '' : 'hidden'}
            `)}
          >
            <div className="px-4 py-1 text-xs font-bold text-gray-400 dark:text-zinc-500">
              {t(`title.rootEntryGroup_${key}`)}
            </div>
            <SideEntryList
              currentPath={currentPath}
              rootEntryList={list || []}
              onRootEntryClick={onRootEntryClick}
              onFavoriteCancel={onFavoriteCancel}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
