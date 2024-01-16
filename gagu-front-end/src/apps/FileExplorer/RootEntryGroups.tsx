import { ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { groupBy } from 'lodash-es'
import { IRootEntry, RootEntryGroup } from '../../types'
import { useDragDrop, useUserConfig } from '../../hooks'
import { getReadableSize, getEntryPath, line } from '../../utils'
import { IconButton, SvgIcon } from '../../components/common'
import { useRecoilState } from 'recoil'
import { baseDataState } from '../../states'

export interface RootEntryGroupsProps {
  currentPath: string
  rootEntryList: IRootEntry[]
  onRootEntryClick: (rootEntry: IRootEntry) => void
  onFavoriteCancel: (rootEntry: IRootEntry) => void
}

export default function RootEntryGroups(props: RootEntryGroupsProps) {

  const {
    currentPath,
    rootEntryList,
    onRootEntryClick,
    onFavoriteCancel,
  } = props

  const { t } = useTranslation()

  const [baseData] = useRecoilState(baseDataState)

  const { userConfig: { kiloSize } } = useUserConfig()

  const dragDropProps = useDragDrop({
    onOpen: (path) => {
      const rootEntry = rootEntryList.find(entry => getEntryPath(entry) === path)
      rootEntry && onRootEntryClick(rootEntry)
    }
  })

  const iconMap = useMemo(() => {
    const iconMap: { [KEY: string]: ReactNode } = {
      'system.win32': <SvgIcon.Windows size={12} />,
      'system.darwin': <SvgIcon.Apple size={12} />,
      'system.linux': <SvgIcon.Linux size={12} />,
      'system.android': <SvgIcon.Android size={12} />,
      user: <SvgIcon.User size={12} />,
      favorite: <SvgIcon.StarSolid size={12} />,
    }
    return iconMap
  }, [])

  const groupMap = useMemo(() => {
    return groupBy(rootEntryList, 'group') as {
      [RootEntryGroup.system]: IRootEntry[] | undefined,
      [RootEntryGroup.user]: IRootEntry[] | undefined,
      [RootEntryGroup.favorite]: IRootEntry[] | undefined,
    }
  }, [rootEntryList])

  return (
    <>
      {[
        { key: 'system', list: groupMap.system },
        { key: 'user', list: groupMap.user },
        { key: 'favorite', list: groupMap.favorite },
      ].map(({ key, list }) => (
        <div
          key={key}
          className={line(`
            mt-3
            ${list?.length ? '' : 'hidden'}
          `)}
        >
          <div className="px-4 py-1 text-xs font-bold text-gray-400 dark:text-zinc-400 flex items-center">
            <span className="-translate-y-[1px]">
              {iconMap[`${key}${key === 'system' ? `.${baseData.serverOS.platform}` : ''}`]}
            </span>
            <span className="ml-1">{t(`title.rootEntryGroup_${key}`)}</span>
          </div>
          {(list || []).map((rootEntry) => {
            const { spaceFree, spaceTotal, name, group, isDisk = false } = rootEntry
            const rootEntryPath = getEntryPath(rootEntry)
            const isActive = rootEntryPath === currentPath
            const canRootEntryClick = currentPath !== rootEntryPath
            const showDiskInfo = !!(isDisk && spaceTotal)
            const spaceUsed = isDisk ? spaceTotal! - spaceFree! : 0

            return (
              <div
                key={rootEntryPath}
                {...dragDropProps}
                data-is-drag-drop-node={isActive ? 'false' : 'true'}
                data-entry-path={rootEntryPath}
                className={line(`
                  gagu-file-explorer-side-entry
                  relative px-3 py-3 md:py-2 text-sm border-l-4 group
                  transition-all duration-200
                  ${isActive
                    ? 'border-blue-500 bg-white text-black dark:bg-zinc-800 dark:text-zinc-200'
                    : `
                      border-transparent text-gray-600 cursor-pointer
                    hover:text-black md:hover:bg-white md:hover:bg-opacity-60
                    dark:text-zinc-200 dark:hover:text-white dark:md:hover:bg-black dark:md:hover:bg-opacity-20
                    `
                  }
                `)}
                onClick={() => canRootEntryClick && onRootEntryClick(rootEntry)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-shrink-0">
                    {isDisk
                      ? <SvgIcon.HardDrive />
                      : <SvgIcon.Folder />
                    }
                  </div>
                  <div
                    className="ml-1 truncate flex-grow"
                    title={name}
                  >
                    {name}
                  </div>
                  {showDiskInfo && (
                    <div className="flex-shrink-0 font-din scale-75 origin-right opacity-60">
                      {`${getReadableSize(spaceUsed!, kiloSize)} / ${getReadableSize(spaceTotal!, kiloSize)}`}
                    </div>
                  )}
                  {group === RootEntryGroup.favorite && (
                    <div
                      className="md:opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton
                        size="xs"
                        className="hover:outline-2 hover:outline-dashed hover:outline-yellow-400"
                        icon={<SvgIcon.StarSolid size={10} className="text-yellow-500" />}
                        onClick={() => onFavoriteCancel(rootEntry)}
                      />
                    </div>
                  )}
                </div>
                {showDiskInfo && (
                  <div className="mt-[2px] text-xs relative z-0 h-[2px] font-din bg-blue-100 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${spaceUsed / spaceTotal! * 100}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </>
  )
}
