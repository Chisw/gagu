import { useCallback, useState } from 'react'
import { Button, ButtonGroup, InputGroup } from '@blueprintjs/core'

export interface PaginationProps {
  pageSize: number
  count: number
  current: number
  onChange: (index: number) => void
}

export default function Pagination(props: PaginationProps) {
  
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
      <ButtonGroup className="bg-white font-din">
        <Button
          icon="chevron-left"
          onClick={() => onChange(prev)}
          disabled={current === FIRST}
        />

        <Button
          onClick={() => onChange(FIRST)}
          active={current === FIRST}
        >
          {FIRST}
        </Button>

        {isLong && groupStart >= (FIRST + GROUP_OFFSET) && ( 
          <Button icon="more" />
        )}

        {GROUP.filter(i => i < groupLen).map(index => {
          const page = groupStart + index
          return (
            <Button
              key={index}
              onClick={() => onChange(page)}
              active={page === current}
            >
              {page}
            </Button>
          )
        })}

        {isLong && groupEnd < pages && (
          <Button icon="more" />
        )}

        {pages !== FIRST && (
          <Button
            active={current === pages}
            onClick={() => onChange(pages)}
          >
            {pages}
          </Button>
        )}

        <Button
          icon="chevron-right"
          onClick={() => onChange(next)}
          disabled={current === pages}
        />
      </ButtonGroup>

      {isLong && (
        <InputGroup
          className="ml-2 w-20"
          placeholder="页码"
          value={jumpValue}
          onChange={(e: any) => setJumpValue(e.target.value)}
          onKeyUp={handleJump}
          rightElement={(
            <Button icon="circle-arrow-right" onClick={() => handleJump({ key: 'Enter' })} />
          )}
        />
      )}
    </div>
  )
}
