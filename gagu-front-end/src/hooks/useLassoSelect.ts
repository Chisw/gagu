import { useEffect } from 'react'
import { ILassoInfo } from '../types'

interface useDragSelectProps {
  binding: boolean
  lassoRef: any
  containerRef: any
  containerInnerRef: any
  onDragging: (info: ILassoInfo) => void
}

export function useLassoSelect(props: useDragSelectProps) {

  const {
    binding,
    lassoRef,
    containerRef,
    containerInnerRef,
    onDragging,
  } = props

  useEffect(() => {
    const listener = () => {
      setTimeout(() => {
        document.querySelectorAll('.gagu-work-area-lasso')
          .forEach((lassoEl: any) => lassoEl.style.display = 'none')
      }, 300)
    }
    document.addEventListener('mouseup', listener)
    return () => document.removeEventListener('mouseup', listener)
  }, [])

  useEffect(() => {

    const lasso: any = lassoRef.current
    const container: any = containerRef.current
    const containerInner: any = containerInnerRef.current
    if (!lasso || !container || !containerInner) return

    let isMouseDown = false
    let startX = 0
    let startY = 0
    let endX = 0
    let endY = 0
    let lassoTop = 0
    let lassoLeft = 0
    let lassoWidth = 0
    let lassoHeight = 0
    let containerTop = 0
    let containerLeft = 0
    let containerInnerWidth = 0
    let containerInnerHeight = 0

    const mousedownListener = (event: any) => {

      const isLeftClick = event.which === 1
      const isStartAtContainerInner = event.target === containerInner
      if (!isLeftClick || !isStartAtContainerInner) return

      isMouseDown = true

      const { top, left } = container.getBoundingClientRect()
      const { width, height } = containerInner.getBoundingClientRect()

      containerTop = top
      containerLeft = left
      containerInnerWidth = width
      containerInnerHeight = height

      startX = (event.x || event.clientX) - containerLeft
      startY = (event.y || event.clientY) - containerTop + container.scrollTop
      lasso.style.left = `${startX}px`
      lasso.style.top = `${startY}px`
    }

    const mousemoveListener = (event: any) => {
      if (isMouseDown) {
        endX = (event.x || event.clientX) - containerLeft
        endY = (event.y || event.clientY) - containerTop + container.scrollTop

        const borderOffset = -2
        const maxWidth = endX > startX
          ? containerInnerWidth - startX + borderOffset
          : startX
        const maxHeight = endY > startY
          ? containerInnerHeight - startY + borderOffset
          : startY

        lassoTop = Math.max(Math.min(endY, startY), 0)
        lassoLeft = Math.max(Math.min(endX, startX), 0)
        lassoWidth = Math.min(Math.abs(endX - startX), maxWidth)
        lassoHeight = Math.min(Math.abs(endY - startY), maxHeight)

        lasso.style.top = `${lassoTop}px`
        lasso.style.left = `${lassoLeft}px`
        lasso.style.width = `${lassoWidth}px`
        lasso.style.height = `${lassoHeight}px`
        lasso.style.display = 'block'
        lasso.style.opacity = 1

        onDragging({
          startX: lassoLeft,
          startY: lassoTop,
          endX: lassoLeft + lassoWidth,
          endY: lassoTop + lassoHeight,
        })
      }
    }

    const mouseupListener = (e: any) => {
      if (!isMouseDown) return
      isMouseDown = false
      lasso.style.transition = 'opacity 300ms'
      lasso.style.opacity = 0
      setTimeout(() => {
        lasso.style.display = 'none'
      }, 300)
    }

    const bind = () => {
      container.addEventListener('mousedown', mousedownListener)
      document.addEventListener('mousemove', mousemoveListener)
      document.addEventListener('mouseup', mouseupListener)
    }

    const unbind = () => {
      container.removeEventListener('mousedown', mousedownListener)
      document.removeEventListener('mousemove', mousemoveListener)
      document.removeEventListener('mouseup', mouseupListener)
    }

    binding ? bind() : unbind()
    return unbind
  }, [binding, lassoRef, containerRef, containerInnerRef, onDragging])
}
