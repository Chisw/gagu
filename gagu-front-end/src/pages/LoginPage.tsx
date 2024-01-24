import { useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { useRequest } from '../hooks'
import { AuthApi, FsApi } from '../api'
import md5 from 'md5'
import { PublicFooter, SvgIcon } from '../components/common'
import { UserInfoStore, line } from '../utils'
import { Input } from '@douyinfe/semi-ui'
import { useRecoilState } from 'recoil'
import { activePageState, userInfoState } from '../states'
import { useTranslation } from 'react-i18next'
import { Page, ServerMessage } from '../types'

export default function LoginPage() {

  const navigate = useNavigate()
  const { t } = useTranslation()

  const [activePage, setActivePage] = useRecoilState(activePageState)
  const [, setUserInfo] = useRecoilState(userInfoState)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [classNames, setClassNames] = useState<string[]>([])

  const { request: login, loading } = useRequest(AuthApi.login)

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
      password: md5(password),
    }
    const { success, message, data: userInfo } = await login(formData)
    if (success) {
      setUserInfo(userInfo)
      UserInfoStore.set(userInfo)
      setActivePage(Page.PENDING)
      setTimeout(handleNavigate, 500)
    } else {
      if (message === ServerMessage.ERROR_USER_NOT_EXISTED) {
        setClassNames(['animate-shake-x', ''])
      } else if (message === ServerMessage.ERROR_PASSWORD_WRONG) {
        setClassNames(['', 'animate-shake-x'])
        setPassword('')
      }
      setTimeout(() => setClassNames([]), 500)
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
      <div className="fixed z-0 inset-0 py-20 overflow-hidden bg-gradient-to-b from-black to-zinc-600 flex justify-center md:items-center">
        <div
          className={line(`
            absolute z-0 inset-0 bg-cover bg-center
            transition-all duration-1000 blur-lg opacity-50
            ${activePage === 'login' ? 'scale-[120%]' : 'scale-110'}
          `)}
          style={{ backgroundImage: `url("${FsApi.getPublicImageStreamUrl('bg-desktop')}")` }}
        />
        <div className="semi-always-dark w-64">
          <div
            className={line(`
              text-white flex justify-center items-center
              transition-all duration-700
              ${activePage === 'login' ? '-translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}
            `)}
          >
            <svg height="24" viewBox="0 0 356 61" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M91.3846 0V60.6316H132V45.4737H152.308V25.2632H132V15.1579H152.308V45.4737V60.6316H172.615V0H91.3846Z" fill="white"/>
              <path d="M81.2308 0H0V60.6316H81.2308V25.2632H60.9231V45.4737H40.6154V15.1579H81.2308V0Z" fill="white"/>
              <path d="M264 0H182.769V60.6316H264V25.2632H243.692V45.4737H223.385V15.1579H264V0Z" fill="white"/>
              <path d="M274.154 0H314.769V45.4737H335.077V0H355.385V60.6316H274.154V0Z" fill="white"/>
            </svg>
          </div>
          <div
            className={line(`
              mt-16 transition-all duration-700
              ${activePage === 'login' ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
            `)}
          >
            <Input
              autoFocus
              size="large"
              placeholder={t`label.username`}
              className={`hover:border-white focus-within:border-white ${classNames[0] || ''}`}
              maxLength={16}
              value={username}
              onChange={(value) => setUsername(value.trim())}
            />
            <Input
              size="large"
              type="password"
              placeholder={t`label.password`}
              className={`mt-4 hover:border-white focus-within:border-white ${classNames[1] || ''}`}
              maxLength={16}
              value={password}
              onChange={setPassword}
              onKeyUp={(e: any) => e.key === 'Enter' && handleLogin()}
              suffix={(
                <button
                  disabled={!username || !password}
                  className={line(`
                    mr-[2px] w-8 h-8 rounded cursor-pointer
                    flex justify-center items-center
                  hover:bg-black hover:bg-opacity-20 active:bg-opacity-30 text-white
                    ${!username || !password ? 'hidden' : ''}
                  `)}
                  onClick={handleLogin}
                >
                  {loading
                    ? <SvgIcon.Loader />
                    : <SvgIcon.ArrowRight />
                  }
                </button>
              )}
            />
          </div>
        </div>
      </div>
      <PublicFooter />
    </>
  )
}
