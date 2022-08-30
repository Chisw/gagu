// https://juejin.cn/post/6844903478934896647

import { useEffect } from 'react'

interface SpectrumCanvasProps {
  audioRef: any
}

export default function SpectrumCanvas(props: SpectrumCanvasProps) {

  const { audioRef } = props

  useEffect(() => {
    const canvas: any = document.getElementById('canvas')
    const context = canvas!.getContext('2d')
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaElementSource(audioRef.current)
    source.connect(analyser)
    analyser.connect(audioContext.destination)

    const arrData = new Uint8Array(analyser.frequencyBinCount)
    const count = Math.min(100, arrData.length)
    const step = Math.round(arrData.length * 0.6 / count)
    const height = canvas.height = window.innerHeight
    const width = canvas.width = window.innerWidth
    const lineWidth = context.lineWidth = canvas.width / count
    const offset = lineWidth / 2

    const render = () => {
      context.clearRect(0, 0, width, height)
      analyser.getByteFrequencyData(arrData)
      for (var i = 0; i < count; i++) {
        const value = arrData[i * step + step]
        const drawX = i * lineWidth + offset
        const drawY = Math.floor(Math.max((height - value * 2), 10))
        context.beginPath()
        context.strokeStyle = `hsl(${Math.round((i * 360) / count)}, 100%, 50%)`
        context.strokeStyle = 'white'
        context.moveTo(drawX, height)
        context.lineTo(drawX, drawY)
        context.stroke()
      }
      requestAnimationFrame(render)
    }
    render()
  }, [audioRef])

  return (
    <canvas
      id="canvas"
      style={{ width: '100%', height: '100%', opacity: .2 }}
    />
  )
}
