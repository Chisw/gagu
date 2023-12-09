import { useCallback, useEffect } from 'react'
import { EntryType, IEntry, INestedFile } from '../types'
import { getDataTransferNestedFileList, getEntryPath, safeQuotes } from '../utils'
import { useRecoilState } from 'recoil'
import { lastChangedDirectoryState } from '../states'
import { useRequest } from './useRequest'
import { FsApi } from '../api'
import { Confirmor } from '../components/common'
import { useTranslation } from 'react-i18next'

const canvas: any = document.getElementById('gagu-drag-img-canvas')
const ctx = canvas.getContext('2d')
const dragBgFolder = new Image()
const dragBgFile = new Image()

dragBgFolder.src = `data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_1572_43)'%3E%3Cg clip-path='url(%23clip1_1572_43)' stroke='%23000' stroke-opacity='.1' stroke-width='.4'%3E%3Cpath d='M10 3.8h-.2V7.2H23.2V5A1.2 1.2 0 0 0 22 3.8H10z'/%3E%3Cpath d='M9.643 2.86l-.058-.06H2A1.2 1.2 0 0 0 .8 4v16A1.2 1.2 0 0 0 2 21.2h20a1.2 1.2 0 0 0 1.2-1.2V7A1.2 1.2 0 0 0 22 5.8h-9.501L9.643 2.86z'/%3E%3C/g%3E%3Cpath d='M10 4h12a1 1 0 0 1 1 1v2H10V4z' fill='%23EAB308'/%3E%3Cpath d='M11 5h11v2H11V5z' fill='%23fff'/%3E%3Cpath d='M12.414 6H22a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.5l2.914 3z' fill='%23FACC15'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_1572_43'%3E%3Cpath fill='%23fff' d='M0 0h24v24H0z'/%3E%3C/clipPath%3E%3CclipPath id='clip1_1572_43'%3E%3Cpath fill='%23fff' d='M0 0h24v24H0z'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E`
dragBgFile.src = `data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 3h12l3 3v15H5V3z' fill='%23fff'/%3E%3Cpath d='M5 3h12l3 3v15H5V3z' fill='%23fff'/%3E%3Cpath d='M5 3v18h15V6l-3-3H5z' stroke='%23EAEAEA' stroke-width='.5'/%3E%3Cpath d='M19.5 6L17 3.5V6h2.5z' fill='%23EAEAEA'/%3E%3Cpath d='M15 7h-5v3h5V8.25h-1.25v1H12.5v-1.5H15V7z' fill='%23DFDFDF'/%3E%3C/svg%3E`

interface useDragTransferProps {
  containerInnerRef: any
  currentPath: string
  entryList: IEntry[]
  selectedEntryList: IEntry[]
  onDrop: (files: INestedFile[], targetDirName?: string) => void
  onOpen: (path: string) => void
}

export function useDragTransfer(props: useDragTransferProps) {

  const {
    containerInnerRef,
    currentPath,
    entryList,
    selectedEntryList,
    onDrop,
    onOpen,
  } = props

  const { t } = useTranslation()

  const [, setLastChangedDirectory] = useRecoilState(lastChangedDirectoryState)

  const { request: updateEntryPath } = useRequest(FsApi.updateEntryPath)

  const handleMoveTransfer = useCallback(async (transferEntryList: IEntry[], targetPath: string) => {
    Confirmor({
      type: 'move',
      content: t('tip.moveEntriesTo', { count: transferEntryList.length, target: targetPath.split('/').pop() }),
      onConfirm: async (close) => {
        for (const transferEntry of transferEntryList) {
          const oldPath = getEntryPath(transferEntry)
          const newPath = `${targetPath}/${transferEntry.name}`

          if (oldPath === targetPath) continue

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

  useEffect(() => {
    const containerInner: any = containerInnerRef.current
    if (!containerInner) return

    let openTimer: NodeJS.Timeout
    let isDragFromCurrentAppWindow = false

    const resetAll = () => {
      clearTimeout(openTimer)
      isDragFromCurrentAppWindow = false

      containerInner.classList.remove('gagu-dragenter-outline')
      containerInner.querySelectorAll('.gagu-entry-node')
        .forEach((el: any) => {
          el.classList.remove('gagu-dragenter-outline')
          el.classList.remove('gagu-dragging-grayscale')
        })
    }

    const dragStartListener = (e: any) => {
      isDragFromCurrentAppWindow = true

      const { target, dataTransfer } = e

      const entryName = target.getAttribute('data-entry-name')

      const transferEntryList = selectedEntryList.some(({ name }) => name === entryName)
        ? selectedEntryList
        : [entryList.find(({ name }) => name === entryName)].filter(Boolean) as IEntry[]

      transferEntryList.forEach(({ name }) => {
        containerInner.querySelector(`.gagu-entry-node[data-entry-name="${safeQuotes(name)}"]`).classList.add('gagu-dragging-grayscale')
      })

      const transferEntryListCount = transferEntryList.length

      if (transferEntryListCount) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        let folderCount = 0
        let fileCount = 0

        transferEntryList.forEach(({ type }) => {
          if (type === 'directory' && folderCount < 3) {
            folderCount++
          } else if (type === 'file' && fileCount < 3) {
            fileCount++
          }
        })
        const fileOffset = fileCount * 6
        const folderOffset = folderCount * 6 + fileOffset
        if (folderCount) {
          for (let i = 0; i < folderCount; i++) {
            ctx.drawImage(dragBgFolder, folderOffset - i * 6, folderOffset - i * 6, 64, 64)
          }
        }
        if (fileCount) {
          for (let i = 0; i < fileCount; i++) {
            ctx.drawImage(dragBgFile, fileOffset - i * 6, fileOffset - i * 6, 64, 64)
          }
        }
        ctx.font = '14px din'
        ctx.fillStyle = '#1d4ed8'
        ctx.strokeStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.lineWidth = 4
        const params = [`+${transferEntryListCount}`, 38, 52]
        ctx.strokeText(...params)
        ctx.fillText(...params)
        dataTransfer.setDragImage(canvas, -64, -64)
        dataTransfer.setData('text/plain', JSON.stringify(transferEntryList))
      }
    }

    const dragEnterListener = (e: any) => {
      const { target } = e

      clearTimeout(openTimer)

      if (target === containerInner) {
        if (isDragFromCurrentAppWindow) return
        containerInner.classList.add('gagu-dragenter-outline')
      } else {
        const closestEntryNode = target.closest('.gagu-entry-node:not(.gagu-dragging-grayscale)')
        const closestEntryName = closestEntryNode?.getAttribute('data-entry-name')
        const closestEntryType = closestEntryNode?.getAttribute('data-entry-type')

        if (closestEntryNode && closestEntryType === EntryType.directory) {
          closestEntryNode.classList.add('gagu-dragenter-outline')
          openTimer = setTimeout(() => {
            const targetDirectory = entryList.find(e => e.name === closestEntryName)
            if (targetDirectory) {
              onOpen(getEntryPath(targetDirectory))
            }
          }, 2000)
        }
      }
    }

    const dragOverListener = (e: any) => {
      e.preventDefault()
    }

    const dragLeaveListener = (e: any) => {
      e.target.classList.remove('gagu-dragenter-outline')
    }

    const dropListener = (e: any) => {
      e.preventDefault()

      const { target, dataTransfer } = e
      const closestEntryNode = target.closest('.gagu-entry-node:not(.gagu-dragging-grayscale)')
      const closestEntryName = closestEntryNode?.getAttribute('data-entry-name')
      const closestEntryType = closestEntryNode?.getAttribute('data-entry-type')
      const transferData = dataTransfer.getData('text/plain')

      // from browser inner
      if (transferData) {
        const transferEntryList: IEntry[] = JSON.parse(transferData || '[]')
        const targetDirectory = entryList.find(e => e.name === closestEntryName)
        if (targetDirectory && closestEntryType === 'directory') {
          handleMoveTransfer(transferEntryList, getEntryPath(targetDirectory))
        } else if (!isDragFromCurrentAppWindow) {
          handleMoveTransfer(transferEntryList, currentPath)
        }
      // from browser outer
      } else {
        const type = entryList.find(e => e.name === closestEntryName)?.type
        if (type === 'file') return
        getDataTransferNestedFileList(dataTransfer).then(files => {
          onDrop(files, closestEntryName)
        })
      }

      resetAll()
    }

    const dragEndListener = (e: any) => {
      e.preventDefault()
      resetAll()
    }

    containerInner.addEventListener('dragstart', dragStartListener)
    containerInner.addEventListener('dragenter', dragEnterListener)
    containerInner.addEventListener('dragover', dragOverListener)
    containerInner.addEventListener('dragleave', dragLeaveListener)
    containerInner.addEventListener('drop', dropListener)
    containerInner.addEventListener('dragend', dragEndListener)

    return () => {
      containerInner.removeEventListener('dragstart', dragStartListener)
      containerInner.removeEventListener('dragenter', dragEnterListener)
      containerInner.removeEventListener('dragover', dragOverListener)
      containerInner.removeEventListener('dragleave', dragLeaveListener)
      containerInner.removeEventListener('drop', dropListener)
      containerInner.removeEventListener('dragend', dragEndListener)
    }
  }, [containerInnerRef, currentPath, entryList, selectedEntryList, onDrop, onOpen, handleMoveTransfer])
}
