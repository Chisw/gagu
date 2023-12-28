import { useMemo } from 'react'
import SideEntryList from '../FileExplorer/SideEntryList'
import { IRootEntry, RootEntryGroup } from '../../types'
import { line } from '../../utils'
import { useTranslation } from 'react-i18next'
import { groupBy } from 'lodash-es'

interface SideProps {
  sideShow: boolean
  setSideShow: (show: boolean) => void
  currentPath: string
  rootEntryList: IRootEntry[]
  onRootEntryClick: (rootEntry: IRootEntry) => void
  onFavoriteCancel: (rootEntry: IRootEntry) => void
  asSelector?: boolean
}

export default function Side(props: SideProps) {

  const {
    sideShow,
    setSideShow,
    currentPath,
    rootEntryList,
    onRootEntryClick,
    onFavoriteCancel,
    asSelector = false,
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
    <>
      <div
        data-vibrate-disabled="true"
        className={line(`
          absolute z-0 bottom-0 left-0 pb-12 w-64
          bg-gray-100 overflow-x-hidden overflow-y-auto border-r
          duration-transform duration-300 ease-in-out
          dark:bg-black dark:border-zinc-600
          ${sideShow ? 'translate-x-0' : '-translate-x-64'}
          ${asSelector ? 'top-0' : 'top-8 md:top-6'}
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
      <div
        className={`absolute z-10 top-8 md:top-6 right-0 bottom-0 left-64 ${sideShow ? '' : 'hidden'}`}
        onClick={() => setSideShow(false)}
      />
    </>
  )
}
