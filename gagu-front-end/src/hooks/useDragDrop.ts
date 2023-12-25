import { useCallback, useEffect } from 'react'
import { IEntry } from '../types'
import { useMoveEntries } from './useMoveEntries'
import { useAddUploadingTask } from './useAddUploadingTask'
import { HOVER_OPEN_TIMER, getDataTransferNestedFileList } from '../utils'

const NODE_SELECTOR = '[data-is-drag-drop-node="true"]'

const controlOutline = (e: any, fn: 'add' | 'remove') => {
  e.target.closest(NODE_SELECTOR)
    ?.classList[fn]('gagu-dragenter-outline')
}

interface useDragDropProps {
  onOpen: (path: string) => void
}

export function useDragDrop({ onOpen }: useDragDropProps) {

  const { handleMove } = useMoveEntries()
  const { handleUploadTaskAdd } = useAddUploadingTask()

  const onDragEnter = useCallback((e: any) => {
    clearTimeout(HOVER_OPEN_TIMER.value)
    controlOutline(e, 'add')

    const path = e.target.closest(NODE_SELECTOR)
      ?.getAttribute('data-entry-path')

    setTimeout(() => {
      HOVER_OPEN_TIMER.value = setTimeout(() => onOpen(path), 1500)
    })
  }, [onOpen])

  const onDragOver = useCallback((e: any) => {
    e.preventDefault()
  }, [])

  const onDragLeave = useCallback((e: any) => {
    controlOutline(e, 'remove')
    clearTimeout(HOVER_OPEN_TIMER.value)
  }, [])

  const onDrop = useCallback((e: any) => {
    e.preventDefault()
    clearTimeout(HOVER_OPEN_TIMER.value)

    const { target, dataTransfer } = e
    const transferData = dataTransfer.getData('text/plain')
    const targetDirectoryPath = target.closest(NODE_SELECTOR)
      ?.getAttribute('data-entry-path')
    
    if (!targetDirectoryPath) return

    // from browser inner
    if (transferData) {
      const transferEntryList: IEntry[] = JSON.parse(transferData || '[]')
      handleMove(transferEntryList, targetDirectoryPath)
    // from browser outer
    } else {
      getDataTransferNestedFileList(dataTransfer).then(files => {
        handleUploadTaskAdd(files, targetDirectoryPath)
      })
    }

    controlOutline(e, 'remove')
  }, [handleMove, handleUploadTaskAdd])

  const onDragEnd = useCallback((e: any) => {
    e.preventDefault()
    controlOutline(e, 'remove')
    clearTimeout(HOVER_OPEN_TIMER.value)
  }, [])

  useEffect(() => {
    const listener = () => {
      clearTimeout(HOVER_OPEN_TIMER.value)
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
