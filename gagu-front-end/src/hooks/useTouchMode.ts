import { useRecoilState } from 'recoil'
import { activePageState } from '../states'
import { useMemo } from 'react'
import { Page } from '../types'

export function useTouchMode() {
  const [activePage] = useRecoilState(activePageState)
  const touchMode = useMemo(() => activePage === Page.touch, [activePage])
  return touchMode
}
