import { useState, useEffect, useMemo } from 'react'
import { useRecoilState } from 'recoil'
import { FsApi } from '../api'
import { entryPathMapState, openOperationState } from '../states'
import { IEntry } from '../types'
import { getIndexLabel } from '../utils'
import { APP_LIST } from '../apps'

export function useOpenOperation(appId: string) {
  const [entryPathMap] = useRecoilState(entryPathMapState)
  const [openOperation, setOpenOperation] = useRecoilState(openOperationState)

  const [matchedEntryList, setMatchedEntryList] = useState<IEntry[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (openOperation?.appId === appId) {
      const { appId, entryList, force } = openOperation
      const matchList = APP_LIST.find(app => app.id === appId)?.matchList

      let matchedEntryList: IEntry[]
      let activeIndex: number

      if (entryList.length === 1) {
        const { name: openName, parentPath} = entryList[0]
        matchedEntryList = (entryPathMap[parentPath]?.list || [])
          .filter(({ name, extension }) => {
            const isForceOpen = force && name === openName
            const isMatched = matchList?.includes(extension)
            return isForceOpen || isMatched
          })
        activeIndex = matchedEntryList.findIndex(entry => entry.name === openName)
      } else {
        matchedEntryList = entryList
        activeIndex = 0
      }

      setMatchedEntryList(matchedEntryList)
      setActiveIndex(activeIndex)
      setOpenOperation(null)
    }
  }, [appId, openOperation, entryPathMap, setOpenOperation])

  const {
    indexLabel,
    activeEntry,
    activeEntryStreamUrl,
  } = useMemo(() => {
    const indexLabel = getIndexLabel(activeIndex, matchedEntryList.length)
    const activeEntry = matchedEntryList[activeIndex]
    const activeEntryStreamUrl = activeEntry
      ? FsApi.getEntryStreamUrl(activeEntry)
      : ''

    return {
      indexLabel,
      activeEntry,
      activeEntryStreamUrl,
    }
  }, [matchedEntryList, activeIndex])

  return {
    matchedEntryList,
    setMatchedEntryList,
    indexLabel,
    activeIndex,
    activeEntry,
    activeEntryStreamUrl,
    setActiveIndex,
  }
}
