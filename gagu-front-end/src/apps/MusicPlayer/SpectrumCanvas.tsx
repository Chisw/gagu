import { useEffect } from 'react'
// import { analyserNode } from '../../MusicPlayer/audio'

interface SpectrumCanvasProps {
  analyserNode: AnalyserNode | null
  color?: string
  opacity?: number
}

export default function SpectrumCanvas(props: SpectrumCanvasProps) {

  const {
    analyserNode,
    color = 'black',
    opacity = .2,
  } = props

  useEffect(() => {
    if (!analyserNode) return
    const canvas: any = document.getElementById('canvas')
    const context = canvas!.getContext('2d')

    const arrData = new Uint8Array(analyserNode.frequencyBinCount)
    const count = Math.min(200, arrData.length)
    const step = Math.floor(arrData.length * .5 / count)
    const height = canvas.height = window.innerHeight
    const width = canvas.width = window.innerWidth
    const lineWidth = context.lineWidth = canvas.width / count
    const offset = lineWidth / 2

    const render = () => {
      context.clearRect(0, 0, width, height)
      analyserNode.getByteFrequencyData(arrData)
      for (var i = 0; i < count; i++) {
        const value = arrData[i * step + step]
        const drawX = i * lineWidth + offset
        const drawY = Math.floor(Math.max((height - value * 2), 10))
        context.beginPath()
        // context.strokeStyle = `hsl(${Math.round((i * 360) / count)}, 100%, 50%)`
        context.strokeStyle = color
        context.moveTo(drawX, height)
        context.lineTo(drawX, drawY)
        context.stroke()
      }
      requestAnimationFrame(render)
    }
    render()
  }, [color, analyserNode])

  return (
    <canvas
      id="canvas"
      className="origin-top-left scale-50"
      style={{ width: '200%', height: '200%', opacity }}
    />
  )
}
