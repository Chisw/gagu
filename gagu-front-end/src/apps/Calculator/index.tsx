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
  ['⌫', 'AC', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['+/−', '0', '.', '='],
]
export default function Calculator({ isTopWindow }: AppComponentProps) {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [stored, setStored] = useState<number | null>(null)
  const [operator, setOperator] = useState<Operator | null>(null)
  const [fresh, setFresh] = useState(true)

  const press = useCallback((key: string) => {
    if (/^\d$/.test(key)) {
      setExpression('')
      setDisplay(current => fresh || current === '错误' ? key : current === '0' ? key : current.length < 18 ? current + key : current)
      setFresh(false)
      return
    }
    if (key === '.') {
      setExpression('')
      setDisplay(current => fresh || current === '错误' ? '0.' : current.includes('.') ? current : current + '.')
      setFresh(false)
      return
    }
    if (key === 'AC') {
      setExpression('')
      setDisplay('0'); setStored(null); setOperator(null); setFresh(true)
      return
    }
    if (key === '⌫') {
      setExpression('')
      setDisplay(current => {
        if (fresh || current === '错误') return '0'
        const next = current.slice(0, -1)
        return next === '' || next === '-' ? '0' : next
      })
      return
    }
    if (key === '+/−') {
      setExpression('')
      setDisplay(current => current === '0' ? current : current.startsWith('-') ? current.slice(1) : '-' + current)
      return
    }
    const value = Number(display)
    if (key === '%') { setExpression(''); setDisplay(format(value / 100)); return }
    if (['+', '−', '×', '÷'].includes(key)) {
      setExpression('')
      const next = stored !== null && operator && !fresh ? calculate(stored, value, operator) : value
      setStored(next); setDisplay(format(next)); setOperator(key as Operator); setFresh(true)
      return
    }
    if (key === '=') {
      if (stored !== null && operator) {
        setExpression(`${format(stored)}${operator}${display}`)
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
      className={`rounded-none border-r border-b border-zinc-800 ${isOperator ? 'text-[24px]' : 'text-lg'} font-normal transition-colors active:brightness-125 ${isOperator ? 'bg-orange-500 text-white hover:bg-orange-400' : (/^(\d|\.)$/.test(key) || key === '+/−') ? 'bg-zinc-600 text-white hover:bg-zinc-500' : 'bg-zinc-500 text-white hover:bg-zinc-400'}`}
      aria-label={key}>{key}</button>
  }

  return <div className="absolute inset-0 flex flex-col bg-zinc-800 text-white select-none overflow-auto">
    <div className="font-din flex-1 min-h-24 flex flex-col items-end justify-end px-5 pb-3 text-right text-[56px] font-light tracking-tight break-all" aria-live="polite">
      {expression && <div className="text-[28px] text-white/50">{expression}</div>}
      <div className="leading-[0.85]">{display}</div>
    </div>
    <div className="grid grid-cols-4 border-t border-l border-zinc-800 auto-rows-[60px]">{basicKeys.flat().map(button)}</div>
  </div>
}
