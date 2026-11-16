import { PointerEvent, ReactNode, useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'
import { baseDataState } from '../../states'
import { TermuxApi } from '../../api'
import { SvgIcon } from '../../components/common'
import { useRequest } from '../../hooks'
import { MI_TV_CMD_MAP } from './cmd-map'

type MiTvCmd = keyof typeof MI_TV_CMD_MAP

const keyFaceClassName = 'fill-[#52525b] stroke-[#3f3f46] stroke-1 transition-[fill] duration-[120ms] group-hover:fill-[#71717a] group-focus-visible:stroke-[#fb923c] group-focus-visible:stroke-3 group-active:fill-[#a1a1aa] group-data-[active=true]:fill-[#a1a1aa]'
const powerFaceClassName = 'fill-[#f97316] stroke-[#3f3f46] stroke-1 transition-[fill] duration-[120ms] group-hover:fill-[#fb923c] group-focus-visible:stroke-[#fb923c] group-focus-visible:stroke-3 group-active:fill-[#fb923c] group-data-[active=true]:fill-[#fb923c]'

export default function MiRemoteControl() {
  const { t, i18n } = useTranslation()
  const baseData = useRecoilValue(baseDataState)
  const { request: createInfraredTransmit } = useRequest(TermuxApi.createInfraredTransmit)
  const svgRef = useRef<SVGSVGElement>(null)
  const [tipLines, setTipLines] = useState<string[]>([])
  const tips = Array.from({ length: 6 }, (_, index) => t(`tip.miRemoteControl.miTV.${index}`))
  const tipText = JSON.stringify(tips)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const context = document.createElement('canvas').getContext('2d')
    if (!context) return
    context.font = `14px ${getComputedStyle(svg).fontFamily}`
    const wrap = () => {
      const maxWidth = Math.max(1, svg.getBoundingClientRect().width - 72)
      const lines: string[] = []
      for (const tip of JSON.parse(tipText) as string[]) {
        let line = ''
        // Keep words together where possible; split long words and CJK as needed.
        for (const token of tip.match(/[^\s\u2e80-\u9fff\uac00-\ud7af]+|[\u2e80-\u9fff\uac00-\ud7af]|\s+/gu) || []) {
          if (line && context.measureText(line + token).width > maxWidth) {
            lines.push(line.trim())
            line = ''
          }
          for (const character of token) {
            if (line && context.measureText(line + character).width > maxWidth) {
              lines.push(line.trim())
              line = ''
            }
            if (line || character.trim()) line += character
          }
        }
        if (line.trim()) lines.push(line.trim())
      }
      setTipLines(lines)
    }
    wrap()
    const observer = new ResizeObserver(wrap)
    observer.observe(svg)
    document.fonts.ready.then(() => { if (svg.isConnected) wrap() })
    return () => observer.disconnect()
  }, [tipText])

  const dotPatternId = useId()
  const sending = useRef(false)
  const [active, setActive] = useState<MiTvCmd | null>(null)

  const [gestureMode, setGestureMode] = useState(false)
  const pointers = useRef(new Map<number, { x: number; y: number; startX: number; startY: number }>())
  const gesture = useRef({ fingers: 0, moved: false, handled: false, started: 0 })
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTap = useRef(0)
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clearTap = () => {
    if (tapTimer.current !== null) clearTimeout(tapTimer.current)
    tapTimer.current = null
    lastTap.current = 0
  }
  const clearHold = () => {
    if (holdTimer.current !== null) clearTimeout(holdTimer.current)
    holdTimer.current = null
  }
  const resetGesture = () => {
    clearHold()
    pointers.current.clear()
    clearTap()
  }
  useEffect(() => () => {
    if (holdTimer.current !== null) clearTimeout(holdTimer.current)
    if (tapTimer.current !== null) clearTimeout(tapTimer.current)
  }, [])

  const transmit = async (command: MiTvCmd) => {
    if (sending.current) return
    if (typeof navigator.vibrate === 'function') navigator.vibrate(12)
    sending.current = true
    setActive(command)
    try {
      await createInfraredTransmit({ frequency: 38000, pattern: MI_TV_CMD_MAP[command][0] })
    } finally {
      sending.current = false
      setActive(null)
    }
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
    }
    if (pointers.current.size === 0) {
      gesture.current = { fingers: 0, moved: false, handled: false, started: Date.now() }
    }
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY })
    gesture.current.fingers = Math.max(gesture.current.fingers, pointers.current.size)
    clearHold()
    if (gesture.current.fingers > 1) clearTap()
    if (gesture.current.fingers <= 2 && !gesture.current.handled && !gesture.current.moved) {
      holdTimer.current = setTimeout(() => {
        if (gesture.current.handled || gesture.current.moved) return
        gesture.current.handled = true
        clearTap()
        transmit(gesture.current.fingers === 2 ? 'HOME' : 'MENU')
      }, 600)
    }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const point = pointers.current.get(event.pointerId)
    if (!point || gesture.current.handled) return
    event.preventDefault()
    point.x = event.clientX
    point.y = event.clientY
    if (Math.hypot(point.x - point.startX, point.y - point.startY) > 10) {
      gesture.current.moved = true
      clearHold()
      clearTap()
    }
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const point = pointers.current.get(event.pointerId)
    if (!point) return
    event.preventDefault()
    clearHold()
    const dx = event.clientX - point.startX
    const dy = event.clientY - point.startY
    const current = gesture.current
    if (!current.handled && current.fingers <= 2 && Math.hypot(dx, dy) >= 30) {
      current.handled = true
      clearTap()
      if (current.fingers === 1) {
        transmit(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'RIGHT' : 'LEFT') : (dy > 0 ? 'DOWN' : 'UP'))
      } else if (Math.abs(dy) > Math.abs(dx)) {
        transmit(dy > 0 ? 'VOLUME_DOWN' : 'VOLUME_UP')
      }
    }
    pointers.current.delete(event.pointerId)
    if (pointers.current.size !== 0 || current.handled || current.moved) return
    if (Date.now() - current.started >= 600) return
    if (current.fingers === 1) {
      const now = Date.now()
      if (lastTap.current && now - lastTap.current <= 300) {
        clearTap()
        transmit('BACK')
      } else {
        lastTap.current = now
        tapTimer.current = setTimeout(() => {
          clearTap()
          transmit('OK')
        }, 300)
      }
    }
  }

  const renderButton = (
    command: MiTvCmd,
    shape: ReactNode,
    icon: ReactNode,
  ) => (
    <g
      key={command}
      role="button"
      tabIndex={active ? -1 : 0}
      aria-label={command}
      aria-disabled={active !== null}
      data-active={active === command}
      className={`group cursor-pointer outline-none aria-disabled:cursor-wait ${command === 'POWER' ? 'text-white' : 'text-[#fafafa]'}`}
      onClick={() => transmit(command)}
      onKeyDown={event => {
        if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
          event.preventDefault()
          transmit(command)
        }
      }}
    >
      {shape}
      <g
        pointerEvents="none"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon}
      </g>
    </g>
  )

  return (
    <div className="absolute inset-0 flex flex-col bg-[#27272a]">
      {!baseData.serverOS.isAndroid && (
        <div className="p-2 font-din bg-yellow-300 text-yellow-700 flex shrink-0">
          <SvgIcon.Warning size={32} className="shrink-0" />
          <div className="ml-2">
            This application requires GAGU to run in Termux with Termux:API installed. Running it in an unsupported environment may cause errors.
          </div>
        </div>
      )}
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      className="block min-h-0 flex-1 bg-[#27272a] select-none touch-manipulation"
      aria-busy={active !== null}
    >
      <svg
        x="20"
        y="20"
        width="52"
        height="52"
        viewBox="134 59 52 52"
      >
      {renderButton(
        'POWER',
        <circle className={powerFaceClassName} cx="160" cy="85" r="25" />,
        <><path d="M160 73v12" /><path d="M153 77a11 11 0 1 0 14 0" /></>,
      )}
      </svg>
      <svg
        x="92"
        y="20"
        width="calc(100% - 112px)"
        height="52"
        role="tablist"
      >
        <rect
          x="0.5"
          y="0.5"
          width="calc(100% - 1px)"
          height="51"
          rx="26"
          fill="none"
          stroke="#71717a"
        />
        {[false, true].map(isGesture => (
          <g
            key={String(isGesture)}
            role="tab"
            tabIndex={0}
            aria-selected={gestureMode === isGesture}
            opacity={gestureMode === isGesture ? 1 : 0.5}
            className="cursor-pointer text-white outline-none focus-visible:stroke-orange-400"
            onClick={() => { resetGesture(); setGestureMode(isGesture) }}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                resetGesture()
                setGestureMode(isGesture)
              }
            }}
          >
            <rect
              x={isGesture ? '50%' : '2'}
              y="2"
              width="calc(50% - 2px)"
              height="48"
              rx="24"
              fill={gestureMode === isGesture ? '#52525b' : 'transparent'}
            />
            <svg
              x={isGesture ? '50%' : '0'}
              y="2"
              width="50%"
              height="48"
              viewBox="0 0 44 36"
              className="pointer-events-none"
            >
              <g
                transform="translate(10 6)"
              >
                {isGesture ? <SvgIcon.EyeOff size={24} /> : <SvgIcon.Eye size={24} />}
              </g>
            </svg>
          </g>
        ))}
      </svg>
      {!gestureMode && <svg
        x="20"
        y="92"
        width="calc(100% - 40px)"
        height="calc(100% - 112px)"
        viewBox="64 140 192 412"
      >
      <circle cx="160" cy="235" r="83" fill="#3f3f46" />
      {renderButton(
        'UP',
        <path className={keyFaceClassName} d="M102 177 A82 82 0 0 1 218 177 L188 207 A40 40 0 0 0 132 207 Z" />,
        <path d="m153 182 7-7 7 7" />,
      )}
      {renderButton(
        'RIGHT',
        <path className={keyFaceClassName} d="M218 177 A82 82 0 0 1 218 293 L188 263 A40 40 0 0 0 188 207 Z" />,
        <path d="m213 228 7 7-7 7" />,
      )}
      {renderButton(
        'DOWN',
        <path className={keyFaceClassName} d="M218 293 A82 82 0 0 1 102 293 L132 263 A40 40 0 0 0 188 263 Z" />,
        <path d="m153 288 7 7 7-7" />,
      )}
      {renderButton(
        'LEFT',
        <path className={keyFaceClassName} d="M102 293 A82 82 0 0 1 102 177 L132 207 A40 40 0 0 0 132 263 Z" />,
        <path d="m107 228-7 7 7 7" />,
      )}
      {renderButton(
        'OK',
        <circle className={keyFaceClassName} cx="160" cy="235" r="37" />,
        <text x="160" y="241" textAnchor="middle" fill="currentColor" stroke="none" fontSize="16">OK</text>,
      )}
      {renderButton(
        'BACK',
        <circle className={keyFaceClassName} cx="88" cy="368" r="28" />,
        <g
          transform="translate(88 368) scale(0.8) translate(-96 -368)"
        >
          <path d="m96 360-8 7 8 7" />
          <path d="M89 367h11a6 6 0 0 1 0 12" />
        </g>,
      )}
      {renderButton(
        'HOME',
        <circle className={keyFaceClassName} cx="160" cy="368" r="28" />,
        <g
          transform="translate(160 368) scale(0.8) translate(-160 -368)"
        >
          <path d="m149 367 11-10 11 10m-19-2v14h16v-14m-11 14v-8h6v8" />
        </g>,
      )}
      {renderButton(
        'MENU',
        <circle className={keyFaceClassName} cx="232" cy="368" r="28" />,
        <g
          transform="translate(232 368) scale(0.8) translate(-224 -368)"
        >
          <path d="M215 361h18m-18 7h18m-18 7h18" />
        </g>,
      )}
      <rect x="132" y="423" width="56" height="116" rx="28" fill="#3f3f46" />
      {renderButton(
        'VOLUME_UP',
        <path className={keyFaceClassName} d="M133 480v-29a27 27 0 0 1 54 0v29Z" />,
        <path d="M151 452h18m-9-9v18" />,
      )}
      {renderButton(
        'VOLUME_DOWN',
        <path className={keyFaceClassName} d="M133 482v29a27 27 0 0 0 54 0v-29Z" />,
        <path d="M151 510h18" />,
      )}
      </svg>}
      <defs>
        <pattern
          id={dotPatternId}
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <rect width="24" height="24" fill="#3f3f46" />
          <circle cx="12" cy="12" r="1" fill="white" fillOpacity="0.2" />
        </pattern>
      </defs>
      {gestureMode && <>
      <rect
        x="20"
        y="92"
        width="calc(100% - 40px)"
        height="calc(100% - 112px)"
        rx="16"
        fill={`url(#${dotPatternId})`}
        stroke="#52525b"
        pointerEvents="none"
      />
      <foreignObject
        x="20"
        y="92"
        width="calc(100% - 40px)"
        height="calc(100% - 112px)"
      >
      <div
        style={{ width: '100%', height: '100%', touchAction: 'none', userSelect: 'none' }}
        className="touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={resetGesture}
        onLostPointerCapture={event => {
          if (pointers.current.has(event.pointerId)) resetGesture()
        }}
        onContextMenu={event => event.preventDefault()}
      />
      </foreignObject>
      <svg
        x="20"
        y="92"
        width="calc(100% - 40px)"
        height="calc(100% - 112px)"
        className="pointer-events-none"
        style={{ pointerEvents: 'none' }}
      >
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          fill="white"
          fillOpacity="0.5"
          fontSize="14"
          direction={i18n.language === 'ar' ? 'rtl' : 'ltr'}
        >
          {tipLines.map((line, index) => (
            <tspan key={index} x="50%" dy={index === 0 ? -(tipLines.length - 1) * 14 + 5 : 28}>
              {line}
            </tspan>
          ))}
        </text>
      </svg>
      </>}
    </svg>
    </div>
  )
}
