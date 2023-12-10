import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'
import { lastChangedDirectoryState } from '../states'
import { useRequest } from './useRequest'
import { FsApi } from '../api'
import { IEntry } from '../types'
import { useCallback } from 'react'
import { Confirmor } from '../components/common'
import { getEntryPath } from '../utils'

export function useMoveEntries() {
  const { t } = useTranslation()

  const [, setLastChangedDirectory] = useRecoilState(lastChangedDirectoryState)

  const { request: updateEntryPath } = useRequest(FsApi.updateEntryPath)

  const handleMove = useCallback(async (transferEntryList: IEntry[], targetPath: string) => {
    Confirmor({
      type: 'move',
      content: t('tip.moveEntriesTo', {
        count: transferEntryList.length,
        target: targetPath.split('/').pop(),
      }),
      onConfirm: async (close) => {
        for (const transferEntry of transferEntryList) {
          const oldPath = getEntryPath(transferEntry)
          const newPath = `${targetPath}/${transferEntry.name}`

          if (targetPath === oldPath) continue

          const { success } = await updateEntryPath(oldPath, newPath)
          if (success) {
            setLastChangedDirectory({
              path: transferEntry.parentPath,
              timestamp: Date.now(),
              otherPaths: [targetPath],
            })
          }
        }
        close()
      },
    })
  }, [t, updateEntryPath, setLastChangedDirectory])

  return { handleMove }
}
