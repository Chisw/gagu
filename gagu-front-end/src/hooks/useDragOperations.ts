import { useCallback, useEffect, useState } from 'react'
import { EntryType, IEntry, INestedFile } from '../types'
import { getDataTransferNestedFileList, getEntryPath } from '../utils'
import { useRecoilState } from 'recoil'
import { lastChangedPathState } from '../states'
import { useRequest } from './useRequest'
import { FsApi } from '../api'
import { useTranslation } from 'react-i18next'
import { Confirmor } from '../components/common'

interface useDragOperationsProps {
  containerInnerRef: any
  entryList: IEntry[]
  selectedEntryList: IEntry[]
  onDrop: (files: INestedFile[], dir?: string) => void
}

const clearOutline = () => document.querySelectorAll('.gagu-entry-node')
  .forEach(el => el.removeAttribute('data-drag-hover'))

const dragImage = new Image()
dragImage.src = `data:image/svg+xml,%3Csvg width='57' height='66' viewBox='0 0 19 22' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.209 2.723l11.95-1.097L16.42 4.34l1.371 14.937-14.937 1.37L1.209 2.724z' fill='%23EEE'/%3E%3Cpath d='M1.209 2.723l11.95-1.097L16.42 4.34l1.371 14.937-14.937 1.37L1.209 2.724z' fill='%23EEE'/%3E%3Cpath d='M1.209 2.723l1.645 17.925 14.937-1.371-1.37-14.937-3.262-2.714-11.95 1.097z' stroke='%23fff'/%3E%3Cpath d='M15.922 4.385l-2.718-2.26.229 2.489 2.49-.229z' fill='%23DDD'/%3E%3Cpath d='M2.991 1.259l11.934 1.266 2.666 3.3L16.01 20.74 1.092 19.158l1.9-17.9z' fill='%23EEE'/%3E%3Cpath d='M2.991 1.259l11.934 1.266 2.666 3.3L16.01 20.74 1.092 19.158l1.9-17.9z' fill='%23EEE'/%3E%3Cpath d='M2.991 1.259l-1.899 17.9L16.01 20.74 17.59 5.825l-2.666-3.3L2.99 1.259z' stroke='%23fff'/%3E%3Cpath d='M17.094 5.772l-2.222-2.75-.264 2.486 2.486.264z' fill='%23DDD'/%3E%3Cpath d='M13.367 7.793l-6.814-.757-.53 4.77 6.813.757.31-2.783-1.704-.189-.176 1.59-1.704-.19.265-2.384 3.407.379.133-1.193z' fill='%23000' fill-opacity='.2'/%3E%3C/svg%3E`


export function useDragOperations(props: useDragOperationsProps) {

  const {
    containerInnerRef,
    entryList,
    selectedEntryList,
    onDrop,
  } = props

  const { t } = useTranslation()
  const [, setLastUploadedPath] = useRecoilState(lastChangedPathState)
  const [isInnerDrag, setIsInnerDrag] = useState(false)

  const { request: renameEntry } = useRequest(FsApi.renameEntry)

  const handleMoveTransfer = useCallback(async (transferEntryList: IEntry[], targetDirectory: IEntry) => {
    Confirmor({
      t,
      type: 'tip',
      content: `${transferEntryList.map(({ name }) => name).join(', ')} -> ${targetDirectory.name}`,
      onConfirm: async (close) => {
        for (const transferEntry of transferEntryList) {
          const oldPath = getEntryPath(transferEntry)
          const newPathParentPath = getEntryPath(targetDirectory)
          const newPath = `${newPathParentPath}/${transferEntry.name}`

          if (oldPath === newPathParentPath) return

          const { success } = await renameEntry(oldPath, newPath)
          if (success) {
            setLastUploadedPath({ path: transferEntry.parentPath, timestamp: Date.now() })
          }
        }
        close()
      },
    })
  }, [t, renameEntry, setLastUploadedPath])

  useEffect(() => {
    const containerInner: any = containerInnerRef.current
    if (!containerInner) return

    const listener = (e: any) => {
      const { type, dataTransfer, target } = e
      const closestEntryNode = target.closest('.gagu-entry-node')

      const entryName = closestEntryNode?.getAttribute('data-entry-name')
      const entryType = closestEntryNode?.getAttribute('data-entry-type')

      const closestEntryName = closestEntryNode
        ? entryName
        : undefined

      if (type !== 'dragstart') {
        e.preventDefault()
        e.stopPropagation()
      }

      if (closestEntryNode && entryType === EntryType.directory) {
        clearOutline()
        closestEntryNode.setAttribute('data-drag-hover', 'true')
      } else {
        clearOutline()
      }

      if (type === 'dragstart') {
        const transferEntryList = selectedEntryList.length
          ? selectedEntryList
          : [entryList.find(e => e.name === entryName && e.type === entryType)].filter(Boolean)

        if (transferEntryList.length) {
          setIsInnerDrag(true)
          dataTransfer.setData('text/plain', JSON.stringify(transferEntryList))
          if (transferEntryList.length > 1) {
            dataTransfer.setDragImage(dragImage, -40, -40)
          }
        }
      }

      if (type === 'dragenter') {
        if (!isInnerDrag && target === containerInner) {
          containerInner.setAttribute('data-drag-hover', 'true')
        }
      }

      if (type === 'dragleave') {
        if (target === containerInner) {
          containerInner.setAttribute('data-drag-hover', 'false')
        }
      }

      if (type === 'drop') {
        setIsInnerDrag(false)
        containerInner.setAttribute('data-drag-hover', 'false')
        const transferData = dataTransfer.getData('text/plain')
        // inner
        if (transferData) {
          const transferEntryList = JSON.parse(transferData)
          const targetDirectory = entryList.find(e => e.name === entryName && e.type === entryType)
          if (targetDirectory && entryType === 'directory') {
            handleMoveTransfer(transferEntryList, targetDirectory)
          }
        // outer
        } else {
          const type = entryList.find(e => e.name === closestEntryName)?.type
          if (type === 'file') return
          getDataTransferNestedFileList(dataTransfer).then(files => {
            onDrop(files, closestEntryName)
            clearOutline()
          })
        }
      }
    }

    containerInner.addEventListener('dragstart', listener)
    containerInner.addEventListener('dragenter', listener)
    containerInner.addEventListener('dragover', listener)
    containerInner.addEventListener('dragleave', listener)
    containerInner.addEventListener('dragend', listener)
    containerInner.addEventListener('drop', listener)

    return () => {
      containerInner.removeEventListener('dragstart', listener)
      containerInner.removeEventListener('dragenter', listener)
      containerInner.removeEventListener('dragover', listener)
      containerInner.removeEventListener('dragleave', listener)
      containerInner.removeEventListener('dragend', listener)
      containerInner.removeEventListener('drop', listener)
    }
  }, [containerInnerRef, entryList, selectedEntryList, onDrop, handleMoveTransfer, isInnerDrag])
}
