import { useEffect } from 'react'
import { EntryType, IEntry, INestedFile } from '../types'
import { HOVER_OPEN_TIMER, getDataTransferNestedFileList, safeQuotes } from '../utils'
import { useMoveEntries } from './useMoveEntries'

const canvas: any = document.getElementById('gagu-drag-img-canvas')
const ctx = canvas.getContext('2d')
const dragBgFolder = new Image()
const dragBgFile = new Image()

dragBgFolder.src = `data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_1572_43)'%3E%3Cg clip-path='url(%23clip1_1572_43)' stroke='%23000' stroke-opacity='.1' stroke-width='.4'%3E%3Cpath d='M10 3.8h-.2V7.2H23.2V5A1.2 1.2 0 0 0 22 3.8H10z'/%3E%3Cpath d='M9.643 2.86l-.058-.06H2A1.2 1.2 0 0 0 .8 4v16A1.2 1.2 0 0 0 2 21.2h20a1.2 1.2 0 0 0 1.2-1.2V7A1.2 1.2 0 0 0 22 5.8h-9.501L9.643 2.86z'/%3E%3C/g%3E%3Cpath d='M10 4h12a1 1 0 0 1 1 1v2H10V4z' fill='%23EAB308'/%3E%3Cpath d='M11 5h11v2H11V5z' fill='%23fff'/%3E%3Cpath d='M12.414 6H22a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.5l2.914 3z' fill='%23FACC15'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_1572_43'%3E%3Cpath fill='%23fff' d='M0 0h24v24H0z'/%3E%3C/clipPath%3E%3CclipPath id='clip1_1572_43'%3E%3Cpath fill='%23fff' d='M0 0h24v24H0z'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E`
dragBgFile.src = `data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17.177 2.823l-.073-.073H4.75v18.5h15.5V5.896l-.073-.073-3-3z' fill='%23fff' stroke='%23EAEAEA' stroke-width='.5'/%3E%3Cpath d='M19.5 6L17 3.5V6h2.5z' fill='%23EAEAEA'/%3E%3Cpath d='M12.5 8.25V7.5l1 1-1 1v-.75h-1v-.5h1zm0-2.25a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1 0-5zm0 4.5a2 2 0 1 0 .001-3.999A2 2 0 0 0 12.5 10.5z' fill='%23CECECE'/%3E%3C/svg%3E`

interface useDragTransferProps {
  containerInnerRef: any
  currentPath: string
  entryList: IEntry[]
  selectedEntryList: IEntry[]
  onDrop: (files: INestedFile[], basePath: string, targetDirName?: string) => void
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

  const { handleMove } = useMoveEntries()

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
          handleMove(transferEntryList, targetDirectoryPath)
        } else if (!isDragFromCurrentPath) {
          handleMove(transferEntryList, currentPath)
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
    onOpen,
    handleMove,
  ])
}
