import { useCallback, useEffect } from 'react'
import { IEntry } from '../types'
import { useMoveEntries } from './useMoveEntries'
import { useAddUploadingTask } from './useAddUploadingTask'
import { getDataTransferNestedFileList } from '../utils'

const NODE_SELECTOR = '[data-is-drag-drop-node="true"]'

const controlOutline = (e: any, fn: 'add' | 'remove') => {
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
    clearTimeout(openTimer)
    controlOutline(e, 'add')

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
    controlOutline(e, 'remove')
    clearTimeout(openTimer)
  }, [])

  const onDrop = useCallback((e: any) => {
    e.preventDefault()
    clearTimeout(openTimer)

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
    clearTimeout(openTimer)
  }, [])

  useEffect(() => {
    const listener = () => {
      clearTimeout(openTimer)
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
