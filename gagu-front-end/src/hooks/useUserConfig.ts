import { useEffect } from 'react'
import { UserConfigStore } from '../utils'
import { userConfigState } from '../states'
import { useRecoilState } from 'recoil'

export function useUserConfig() {
  const [userConfig, setUserConfig] = useRecoilState(userConfigState)

  useEffect(() => {
    UserConfigStore.set(userConfig)
  }, [userConfig])

  return { userConfig, setUserConfig }
}
