import { useEffect } from 'react'
import { getDTNestedFileList } from '../utils'
import { INestedFile } from '../utils/types'

interface useDragOperationsProps {
  containerInnerRef: any
  onEnterContainer: () => void
  onLeaveContainer: () => void
  onUpload: (files: INestedFile[], dir?: string) => void
}

const clear = () => document.querySelectorAll('.entry-node').forEach(el => el.removeAttribute('data-drag-hover'))

export default function useDragOperations(props: useDragOperationsProps) {

  const {
    containerInnerRef,
    onEnterContainer,
    onLeaveContainer,
    onUpload,
  } = props

  useEffect(() => {
    const containerInner: any = containerInnerRef.current
    if (!containerInner) return

    const listener = (e: any) => {
      e.preventDefault()
      e.stopPropagation()

      const { type, dataTransfer, target } = e
      const closestDir = target.closest('[data-dir="true"]')

      if (closestDir) {
        clear()
        closestDir.setAttribute('data-drag-hover', 'true')
      } else {
        clear()
      }

      const destDir = closestDir ? closestDir.getAttribute('data-name') : undefined

      if (type === 'dragenter' || target === containerInner) {
        onEnterContainer()
      }
      if (type === 'dragleave') {
        onLeaveContainer()
      }
      if (type === 'drop') {
        getDTNestedFileList(dataTransfer).then(files => {
          onUpload(files, destDir)
          clear()
        })
      }
    }

    const bind = () => {
      containerInner.addEventListener('dragenter', listener)
      containerInner.addEventListener('dragover', listener)
      containerInner.addEventListener('dragleave', listener)
      containerInner.addEventListener('dragend', listener)
      containerInner.addEventListener('drop', listener)

    }

    const unbind = () => {
      containerInner.removeEventListener('dragenter', listener)
      containerInner.removeEventListener('dragover', listener)
      containerInner.removeEventListener('dragleave', listener)
      containerInner.removeEventListener('dragend', listener)
      containerInner.removeEventListener('drop', listener)
    }

    bind()
    return unbind
  }, [containerInnerRef, onEnterContainer, onLeaveContainer, onUpload])

}
