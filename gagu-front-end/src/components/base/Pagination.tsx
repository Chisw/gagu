import { useCallback, useState } from 'react'
import { SvgIcon } from './SvgIcon'

export interface PaginationProps {
  pageSize: number
  count: number
  current: number
  onChange: (index: number) => void
}

export function Pagination(props: PaginationProps) {
  
  const { pageSize, count, current, onChange } = props
  const pages = Math.ceil( count / pageSize )
  const prev = current - 1
  const next = current + 1

  const FIRST = 1
  const GROUP = [0, 1, 2, 3, 4]
  const GROUP_OFFSET = 2
  const DEFAULT_GROUP_LEN = GROUP.length
  const DEFAULT_GROUP_START = 2
  let isLong = true
  let groupStart = 0
  let groupLen = 0
  let groupEnd = 0

  if (pages <= 7) {
    isLong = false
    groupStart = DEFAULT_GROUP_START
    groupLen = pages - groupStart
  } else {
    const lastGroupStart = pages - DEFAULT_GROUP_LEN
    groupStart = Math.max(current - GROUP_OFFSET, DEFAULT_GROUP_START)
    groupStart = Math.min(groupStart, lastGroupStart)
    groupLen = Math.min(pages - groupStart, DEFAULT_GROUP_LEN)
    groupEnd = groupStart + groupLen
  }

  const [jumpValue, setJumpValue] = useState('')

  const handleJump = useCallback((e: any) => {
    if (e.key === 'Enter') {
      const val = +jumpValue
      if (!isNaN(val) && 0 < val && val <= pages) {
        onChange(val)
      } else {
        setJumpValue('')
      }
    }
  }, [jumpValue, pages, onChange])

  if (count <= 0) return <></>

  return (
    <div className="flex p-1 bg-white rounded-lg shadow-lg select-none">
      <div className="flex items-center bg-white font-din">
        <button
          className="w-4 hover:bg-gray-100"
          onClick={() => onChange(prev)}
          disabled={current === FIRST}
        >
          <SvgIcon.ChevronLeft />
        </button>
      

        <button
          className="w-4 hover:bg-gray-100"
          onClick={() => onChange(FIRST)}
          disabled={current === FIRST}
        >
          {FIRST}
        </button>

        {isLong && groupStart >= (FIRST + GROUP_OFFSET) && ( 
          <button className="w-4 hover:bg-gray-100">...</button>
        )}

        {GROUP.filter(i => i < groupLen).map(index => {
          const page = groupStart + index
          return (
            <button
              className="w-4 hover:bg-gray-100"
              key={index}
              onClick={() => onChange(page)}
              disabled={page === current}
            >
              {page}
            </button>
          )
        })}

        {isLong && groupEnd < pages && (
          <button className="w-4 hover:bg-gray-100">...</button>
        )}

        {pages !== FIRST && (
          <button
            className="w-4 hover:bg-gray-100"
            onClick={() => onChange(pages)}
            disabled={current === pages}
          >
            {pages}
          </button>
        )}

        <button
          className="w-4 hover:bg-gray-100"
          onClick={() => onChange(next)}
          disabled={current === pages}
        >
          <SvgIcon.ChevronRight />
        </button>
      </div>

      {isLong && (
        <>
          <input
            className="ml-2 w-10"
            placeholder="页码"
            value={jumpValue}
            onChange={(e: any) => setJumpValue(e.target.value)}
            onKeyUp={handleJump}
          />
          <button
            className="w-4 hover:bg-gray-100"
            onClick={() => handleJump({ key: 'Enter' })}
          >
            <SvgIcon.ChevronRight />
          </button>
        </>
      )}
    </div>
  )
}
