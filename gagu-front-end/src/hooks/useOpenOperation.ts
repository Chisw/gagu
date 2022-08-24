import { useState, useEffect, useMemo } from 'react'
import { useRecoilState } from 'recoil'
import { FsApi } from '../api'
import { openOperationState } from '../utils/state'
import { IEntry } from '../utils/types'

export function useOpenOperation(appId: string) {
  const [openOperation, setOpenOperation] = useRecoilState(openOperationState)
  const [matchedEntryList, setMatchedEntryList] = useState<IEntry[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (openOperation && openOperation.app.id === appId) {
      const { matchedEntryList, activeEntryIndex } = openOperation
      setMatchedEntryList(matchedEntryList)
      setActiveIndex(activeEntryIndex)
      setOpenOperation(null)
    }
  }, [appId, openOperation, setOpenOperation])

  const {
    activeEntry,
    activeEntryStreamUrl,
  } = useMemo(() => {
    const activeEntry: IEntry | undefined = matchedEntryList[activeIndex]
    const activeEntryStreamUrl = activeEntry
      ? FsApi.getFileStreamUrl(`${activeEntry.parentPath}/${activeEntry.name}`)
      : ''

    return {
      activeEntry,
      activeEntryStreamUrl,
    }
  }, [matchedEntryList, activeIndex])

  return {
    matchedEntryList,
    activeIndex,
    activeEntry,
    activeEntryStreamUrl,
    setActiveIndex,
  }
}
