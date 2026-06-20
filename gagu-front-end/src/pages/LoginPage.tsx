import { useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRequest } from '../hooks'
import { AuthApi, FsApi } from '../api'
import { PublicFooter, SvgIcon } from '../components/common'
import { DURATION_PAGE, UserInfoStore, line, sha256 } from '../utils'
import { Input } from '@douyinfe/semi-ui'
import { useRecoilState } from 'recoil'
import { activePageState, userInfoState } from '../states'
import { useTranslation } from 'react-i18next'
import { Page } from '../types'
import { ServerMessage } from '@shared'
import { motion } from 'motion/react'

export default function LoginPage() {

  const navigate = useNavigate()
  const { t } = useTranslation()

  const [activePage, setActivePage] = useRecoilState(activePageState)
  const [, setUserInfo] = useRecoilState(userInfoState)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [classNames, setClassNames] = useState<string[]>([])

  const { request: login, loading } = useRequest(AuthApi.login)

  const isPending = useMemo(() => activePage === Page.PENDING, [activePage])

  const handleNavigate = useCallback(() => {
    const { innerWidth } = window
    if (innerWidth > 1200) {
      navigate('/')
    } else {
      navigate(`/${Page.touch}`)
    }
  }, [navigate])

  const handleLogin = useCallback(async () => {
    const formData = {
      username,
      password: sha256(password),
    }
    const { success, message, data: userInfo } = await login(formData)
    if (success) {
      setUserInfo(userInfo)
      UserInfoStore.set(userInfo)
      setActivePage(Page.PENDING)
      setTimeout(handleNavigate, DURATION_PAGE)
    } else {
      if (message === ServerMessage.ERROR_USER_NOT_EXISTED) {
        setClassNames(['animate-shake-x', ''])
      } else if (message === ServerMessage.ERROR_PASSWORD_WRONG) {
        setClassNames(['', 'animate-shake-x'])
        setPassword('')
      }
      setTimeout(() => setClassNames([]), DURATION_PAGE)
    }
  }, [username, password, login, setUserInfo, handleNavigate, setActivePage])

  useEffect(() => {
    setTimeout(() => setActivePage(Page.login))
  }, [setActivePage])

  useEffect(() => {
    if (UserInfoStore.get()) {
      handleNavigate()
    }
  }, [handleNavigate])
  
  return (
    <>
      <div className="fixed z-0 inset-0 py-20 overflow-hidden bg-linear-to-b from-[#2F0059] to-[#9F00DE] flex justify-center md:items-center">
        <div
          className={line(`
            absolute z-0 inset-0 bg-cover bg-center
            transition-all duration-1000 blur-lg opacity-50
            ${activePage === 'login' ? 'scale-[120%]' : 'scale-110'}
          `)}
          style={{ backgroundImage: `url("${FsApi.getPublicImageStreamUrl('bg-desktop')}")` }}
        />
        <div className="semi-always-dark w-64">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={isPending ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
            transition={{ duration: DURATION_PAGE / 1000 }}
            className="flex-center-center"
          >
            <svg height="24" viewBox="0 0 380 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M80 20H40V60H60V40H80V80H0V0H80V20Z" fill="white"/>
              <path d="M280 20H240V60H260V40H280V80H200V0H280V20Z" fill="white"/>
              <path d="M180 80H160V60H140V80H100V0H180V80ZM140 20V40H160V20H140Z" fill="white"/>
              <path d="M380 80H300V0H340V60H360V0H380V80Z" fill="white"/>
            </svg>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isPending ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            transition={{ duration: DURATION_PAGE / 1000 }}
            className="mt-12"
          >
            <Input
              autoFocus
              size="large"
              placeholder={t`label.username`}
              className={`border hover:border-white/40! focus-within:border-white/40! ${classNames[0] || ''}`}
              maxLength={16}
              value={username}
              onChange={(value) => setUsername(value.trim())}
            />
            <Input
              size="large"
              type="password"
              placeholder={t`label.password`}
              className={`mt-4 hover:border-white/40! focus-within:border-white/40! ${classNames[1] || ''}`}
              maxLength={16}
              value={password}
              onChange={setPassword}
              onKeyUp={(e: any) => e.key === 'Enter' && handleLogin()}
              suffix={(
                <button
                  disabled={!username || !password}
                  className={line(`
                    mr-0.5 w-8 h-8 rounded cursor-pointer
                    flex-center-center
                  hover:bg-white/10 active:bg-opacity-20 text-white
                    ${!username || !password ? 'hidden' : ''}
                  `)}
                  onClick={handleLogin}
                >
                  {loading
                    ? <SvgIcon.Loader className="animate-spin" />
                    : <SvgIcon.ArrowRight />
                  }
                </button>
              )}
            />
          </motion.div>
        </div>
      </div>
      <PublicFooter />
    </>
  )
}
