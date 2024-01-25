import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'
import { lastChangedDirectoryState } from '../states'
import { useRequest } from './useRequest'
import { FsApi } from '../api'
import { ExistingStrategyType, IEntry } from '../types'
import { useCallback } from 'react'
import { Confirmor, ExistingConfirmor } from '../components/common'
import { getEntryPath } from '../utils'

export function useMoveEntries() {
  const { t } = useTranslation()

  const [, setLastChangedDirectory] = useRecoilState(lastChangedDirectoryState)

  const { request: moveEntry } = useRequest(FsApi.moveEntry)
  const { request: queryExistsCount } = useRequest(FsApi.queryExistsCount)

  const handleMoveStart = useCallback(async (entryList: IEntry[], targetDirectoryPath: string, strategy?: ExistingStrategyType) => {
    for (const entry of entryList) {
      const fromPath = getEntryPath(entry)
      const toPath = `${targetDirectoryPath}/${entry.name}`
      const { success } = await moveEntry(fromPath, toPath, strategy)
      if (success) {
        setLastChangedDirectory({
          path: entry.parentPath,
          timestamp: Date.now(),
          otherPaths: [targetDirectoryPath],
        })
      }
    }
  }, [moveEntry, setLastChangedDirectory])

  const handleMoveCheck = useCallback(async (entryList: IEntry[], targetDirectoryPath: string) => {
    const pathList = entryList.map(entry => `${targetDirectoryPath}/${entry.name}`)
    const { data: count } = await queryExistsCount({ pathList })
    if (count) {
      ExistingConfirmor({
        count,
        onConfirm: (strategy) => handleMoveStart(entryList, targetDirectoryPath, strategy),
      })
    } else {
      handleMoveStart(entryList, targetDirectoryPath)
    }
  }, [handleMoveStart, queryExistsCount])

  const handleMove = useCallback(async (entryList: IEntry[], targetDirectoryPath: string) => {
    const isMovementNoChange = entryList.some(({ parentPath }) => parentPath === targetDirectoryPath)
    if (isMovementNoChange) return

    Confirmor({
      type: 'move',
      content: t('tip.moveEntriesTo', {
        count: entryList.length,
        target: targetDirectoryPath.split('/').pop(),
      }),
      onConfirm: (close) => {
        close()
        handleMoveCheck(entryList, targetDirectoryPath)
      },
    })
  }, [handleMoveCheck, t])

  return { handleMove }
}
