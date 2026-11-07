import { useCallback, useEffect, useState } from 'react'
import { AppComponentProps } from '../../types'

type Operator = '+' | '−' | '×' | '÷'

const calculate = (left: number, right: number, op: Operator): number => {
  switch (op) {
    case '+': return left + right
    case '−': return left - right
    case '×': return left * right
    case '÷': return left / right
  }
}

const format = (value: number): string => {
  if (!Number.isFinite(value)) return '错误'
  return String(Number(value.toPrecision(12)))
}

const basicKeys = [
  ['AC', '+/−', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
]
export default function Calculator({ isTopWindow }: AppComponentProps) {
  const [display, setDisplay] = useState('0')
  const [stored, setStored] = useState<number | null>(null)
  const [operator, setOperator] = useState<Operator | null>(null)
  const [fresh, setFresh] = useState(true)

  const press = useCallback((key: string) => {
    if (/^\d$/.test(key)) {
      setDisplay(current => fresh || current === '错误' ? key : current === '0' ? key : current.length < 18 ? current + key : current)
      setFresh(false)
      return
    }
    if (key === '.') {
      setDisplay(current => fresh || current === '错误' ? '0.' : current.includes('.') ? current : current + '.')
      setFresh(false)
      return
    }
    if (key === 'AC') {
      setDisplay('0'); setStored(null); setOperator(null); setFresh(true)
      return
    }
    if (key === '⌫') {
      setDisplay(current => fresh || current.length <= 1 ? '0' : current.slice(0, -1))
      return
    }
    if (key === '+/−') {
      setDisplay(current => current === '0' ? current : current.startsWith('-') ? current.slice(1) : '-' + current)
      return
    }
    const value = Number(display)
    if (key === '%') { setDisplay(format(value / 100)); return }
    if (['+', '−', '×', '÷'].includes(key)) {
      const next = stored !== null && operator && !fresh ? calculate(stored, value, operator) : value
      setStored(next); setDisplay(format(next)); setOperator(key as Operator); setFresh(true)
      return
    }
    if (key === '=') {
      if (stored !== null && operator) {
        setDisplay(format(calculate(stored, value, operator)))
        setStored(null); setOperator(null); setFresh(true)
      }
      return
    }

  }, [display, fresh, operator, stored])

  useEffect(() => {
    if (!isTopWindow) return
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return
      const mapped: Record<string, string> = { '*': '×', '/': '÷', '-': '−', Enter: '=', '=': '=', Escape: 'AC', Backspace: '⌫' }
      const key = mapped[event.key] || event.key
      if (/^\d$/.test(key) || ['.', '+', '−', '×', '÷', '=', 'AC', '⌫', '%'].includes(key)) {
        event.preventDefault(); press(key)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isTopWindow, press])

  const button = (key: string, index: number) => {
    const isOperator = ['+', '−', '×', '÷', '='].includes(key)
    return <button key={`${key}-${index}`} type="button" onClick={() => press(key)}
      className={`${key === '0' ? 'col-span-2 text-left pl-6' : ''} rounded-full text-lg font-normal transition-colors active:brightness-125 ${isOperator ? 'bg-orange-500 text-white hover:bg-orange-400' : /^(\d|\.)$/.test(key) ? 'bg-zinc-600 text-white hover:bg-zinc-500' : 'bg-zinc-500 text-white hover:bg-zinc-400'}`}
      aria-label={key}>{key}</button>
  }

  return <div className="absolute inset-0 flex flex-col bg-zinc-800 text-white select-none overflow-auto">
    <div className="font-din flex-1 min-h-24 flex items-end justify-end px-5 pb-3 text-right text-5xl font-light tracking-tight break-all" aria-live="polite">{display}</div>
    <div className="grid grid-cols-4 gap-1.5 px-3 pb-3 auto-rows-[56px]">{basicKeys.flat().map(button)}</div>
  </div>
}
