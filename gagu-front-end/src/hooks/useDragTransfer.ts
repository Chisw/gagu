import { useEffect } from 'react'
import { EntryType, IEntry, INestedFile } from '../types'
import { HOVER_OPEN_TIMER, dragFileSvg, dragFolderSvg, getDataTransferNestedFileList, safeQuotes } from '../utils'

const canvas: any = document.getElementById('gagu-drag-img-canvas')
const ctx = canvas.getContext('2d')
const dragBgFolder = new Image()
const dragBgFile = new Image()

dragBgFolder.src = dragFolderSvg
dragBgFile.src = dragFileSvg

interface useDragTransferProps {
  containerInnerRef: any
  currentPath: string
  entryList: IEntry[]
  selectedEntryList: IEntry[]
  onDrop: (files: INestedFile[], basePath: string, targetDirName?: string) => void
  onMove: (entryList: IEntry[], path: string) => void
  onOpen: (path: string) => void
}

export function useDragTransfer(props: useDragTransferProps) {

  const {
    containerInnerRef,
    currentPath,
    entryList,
    selectedEntryList,
    onDrop,
    onMove,
    onOpen,
  } = props

  useEffect(() => {
    const containerInner: any = containerInnerRef.current
    if (!containerInner) return

    let isDragFromCurrentPath = false

    const resetAll = () => {
      clearTimeout(HOVER_OPEN_TIMER.value)
      isDragFromCurrentPath = false

      containerInner.classList.remove('gagu-dragenter-outline', 'gagu-dragging-children-events-none')
      containerInner.querySelectorAll('.gagu-dragenter-outline, .gagu-dragging-grayscale')
        .forEach((el: any) => {
          el.classList.remove('gagu-dragenter-outline', 'gagu-dragging-grayscale')
        })
    }

    const dragStartListener = (e: any) => {
      isDragFromCurrentPath = true

      const { target, dataTransfer } = e

      const entryName = target.getAttribute('data-entry-name')

      const transferEntryList = selectedEntryList.some(({ name }) => name === entryName)
        ? selectedEntryList
        : [entryList.find(({ name }) => name === entryName)].filter(Boolean) as IEntry[]

      transferEntryList.forEach(({ name }) => {
        containerInner.querySelector(`.gagu-entry-node[data-entry-name="${safeQuotes(name)}"]`)
          .classList.add('gagu-dragging-grayscale')
      })

      const transferEntryListCount = transferEntryList.length

      if (transferEntryListCount) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        let folderCount = 0
        let fileCount = 0

        transferEntryList.forEach(({ type }) => {
          if (type === EntryType.directory && folderCount < 3) {
            folderCount++
          } else if (type === EntryType.file && fileCount < 3) {
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

        dataTransfer.setDragImage(canvas, -12, -12)
        dataTransfer.setData('text/plain', JSON.stringify(transferEntryList))
        // TODO: convert paths to download-tunnel on the back-end
        // dataTransfer.setData('DownloadURL', `application/octet-stream:${fileName}:${urlWithPaths}`)
      }
    }

    const dragEnterListener = (e: any) => {
      clearTimeout(HOVER_OPEN_TIMER.value)

      setTimeout(() => containerInner.classList.add('gagu-dragging-children-events-none'))

      const { target } = e
      const closestEntryNode = target.closest('.gagu-entry-node:not(.gagu-dragging-grayscale)')
      const closestEntryName = closestEntryNode?.getAttribute('data-entry-name')
      const closestEntryType = closestEntryNode?.getAttribute('data-entry-type')

      if (target === containerInner) {
        if (isDragFromCurrentPath) return
        containerInner.classList.add('gagu-dragenter-outline')
      } else if (closestEntryType === EntryType.directory) {
        closestEntryNode.classList.add('gagu-dragenter-outline')
        HOVER_OPEN_TIMER.value = setTimeout(() => onOpen(`${currentPath}/${closestEntryName}`), 1500)
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
      const transferData = dataTransfer.getData('text/plain')
      const closestEntryNode = target.closest('.gagu-entry-node:not(.gagu-dragging-grayscale)')
      const closestEntryName = closestEntryNode?.getAttribute('data-entry-name')
      const closestEntryType = closestEntryNode?.getAttribute('data-entry-type')

      // from browser inner
      if (transferData) {
        const transferEntryList: IEntry[] = JSON.parse(transferData || '[]')
        if (closestEntryType === EntryType.directory) {
          const targetDirectoryPath = `${currentPath}/${closestEntryName}`
          onMove(transferEntryList, targetDirectoryPath)
        } else if (!isDragFromCurrentPath) {
          onMove(transferEntryList, currentPath)
        }
      // from browser outer
      } else {
        if (closestEntryType === EntryType.file) return
        getDataTransferNestedFileList(dataTransfer).then(files => {
          onDrop(files, currentPath, closestEntryName)
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
    document.addEventListener('mouseup', resetAll)

    return () => {
      containerInner.removeEventListener('dragstart', dragStartListener)
      containerInner.removeEventListener('dragenter', dragEnterListener)
      containerInner.removeEventListener('dragover', dragOverListener)
      containerInner.removeEventListener('dragleave', dragLeaveListener)
      containerInner.removeEventListener('drop', dropListener)
      containerInner.removeEventListener('dragend', dragEndListener)
      document.removeEventListener('mouseup', resetAll)
    }
  }, [
    containerInnerRef,
    currentPath,
    entryList,
    selectedEntryList,
    onDrop,
    onMove,
    onOpen,
  ])
}
