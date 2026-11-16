import { useCallback, useEffect, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import { FsApi } from '../api'
import { baseDataState, userInfoState } from '../states'
import { GAGU_DOCUMENT_TITLE, UserInfoStore } from '../utils'

export function useSystemBootstrap(requireSession: boolean) {
  const [userInfo, setUserInfo] = useRecoilState(userInfoState)
  const [baseData, setBaseData] = useRecoilState(baseDataState)

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loading, setLoading] = useState(false)

  const pending = useRef<Promise<boolean> | null>(null)
  const ready = useRef(false)

  const storedUser = UserInfoStore.get()
  const needsLogin = requireSession && !userInfo && !storedUser

  const refresh = useCallback(() => {
    if (pending.current) return pending.current
    setLoading(true)
    pending.current = (async () => {
      try {
        const { success, data } = await FsApi.queryBaseData()
        if (!success) throw new Error('Unable to initialize file services')
        setBaseData(data)
        ready.current = true
        setStatus('ready')
        return true
      } catch {
        if (!ready.current) setStatus('error')
        return false
      } finally {
        setLoading(false)
        pending.current = null
      }
    })()
    return pending.current
  }, [setBaseData])

  useEffect(() => {
    const info = UserInfoStore.get()

    if (info) setUserInfo(info)

    if (!requireSession) {
      setStatus('ready')
    } else if (info && !ready.current) {
      setStatus('loading')
      void refresh()
    }
  }, [requireSession, refresh, setUserInfo])

  useEffect(() => {
    document.title = `${baseData.deviceName === '--' ? '' : `${baseData.deviceName} - `}${GAGU_DOCUMENT_TITLE}`
  }, [baseData.deviceName])

  return {
    status,
    loading,
    refresh,
    needsLogin,
    ready: ready.current,
  }
}
