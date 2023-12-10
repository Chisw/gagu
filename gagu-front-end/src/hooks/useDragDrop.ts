import { useCallback, useEffect } from 'react'
import { IEntry } from '../types'
import { useMoveEntries } from './useMoveEntries'
import { useAddUploadingTask } from './useAddUploadingTask'
import { getDataTransferNestedFileList } from '../utils'

const NODE_SELECTOR = '[data-is-drag-drop-node="true"]'

const outline = (e: any, fn: 'add' | 'remove') => {
  e.target.closest(NODE_SELECTOR)
    ?.classList[fn]('gagu-dragenter-outline')
}

let openTimer: NodeJS.Timeout | undefined

interface useDragDropProps {
  onOpen: (path: string) => void
}

export function useDragDrop({ onOpen }: useDragDropProps) {

  const { handleMove } = useMoveEntries()
  const { handleUploadTaskAdd } = useAddUploadingTask()

  const onDragEnter = useCallback((e: any) => {
    outline(e, 'add')
    clearTimeout(openTimer)

    const path = e.target.closest(NODE_SELECTOR)
      ?.getAttribute('data-entry-path')

    setTimeout(() => {
      openTimer = setTimeout(() => onOpen(path), 1500)
    })
  }, [onOpen])

  const onDragOver = useCallback((e: any) => {
    e.preventDefault()
  }, [])

  const onDragLeave = useCallback((e: any) => {
    outline(e, 'remove')
    clearTimeout(openTimer)
  }, [])

  const onDrop = useCallback((e: any) => {
    e.preventDefault()
    clearTimeout(openTimer)

    const { target, dataTransfer } = e
    const transferData = dataTransfer.getData('text/plain')
    const targetPath = target.closest(NODE_SELECTOR)
      ?.getAttribute('data-entry-path')
    
    if (!targetPath) return

    // from browser inner
    if (transferData) {
      const transferEntryList: IEntry[] = JSON.parse(transferData || '[]')
      handleMove(transferEntryList, targetPath)
    // from browser outer
    } else {
      getDataTransferNestedFileList(dataTransfer).then(files => {
        handleUploadTaskAdd(files, targetPath)
      })
    }

    outline(e, 'remove')
  }, [handleMove, handleUploadTaskAdd])

  const onDragEnd = useCallback((e: any) => {
    e.preventDefault()
    outline(e, 'remove')
    clearTimeout(openTimer)
  }, [])

  useEffect(() => {
    const listener = () => {
      document.querySelectorAll('.gagu-dragenter-outline')
        .forEach(el => el.classList.remove('gagu-dragenter-outline'))
    }
    document.addEventListener('mouseup', listener)
    return () => document.removeEventListener('mouseup', listener)
  }, [])

  return {
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
  }
}
