import { useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { useFetch } from '../hooks'
import { AuthApi } from '../api'
import md5 from 'md5'
import toast from 'react-hot-toast'
import { SvgIcon } from '../components/base'
import { USER_INFO } from '../utils'
import { Input } from '@douyinfe/semi-ui'
import { useRecoilState } from 'recoil'
import { userInfoState } from '../states'
import { useTranslation } from 'react-i18next'
import PublicFooter from '../components/PublicFooter'

export default function LoginPage() {

  const navigate = useNavigate()
  const { t } = useTranslation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (USER_INFO.get()) {
      navigate('/')
    }
  }, [navigate])

  const [, setUserInfo] = useRecoilState(userInfoState)

  const { fetch: login, loading } = useFetch(AuthApi.login)

  const handleLogin = useCallback(async () => {
    const formData = {
      username,
      password: md5(password),
    }
    const res = await login(formData)
    if (res.success) {
      setUserInfo(res.userInfo)
      USER_INFO.set(res.userInfo)
      navigate('/')
    } else {
      toast.error(t(`server.${res.message}`))
    }
  }, [username, password, login, setUserInfo, navigate, t])
  
  return (
    <>
      <div className="fixed z-0 inset-0 overflow-hidden bg-gradient-to-b from-gray-800 to-gray-600 flex justify-center items-center">
        <div className="semi-always-dark w-64">
          <div className="text-white flex justify-center items-center">
            <svg height="24" viewBox="0 0 356 61" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M91.3846 0V60.6316H132V45.4737H152.308V25.2632H132V15.1579H152.308V45.4737V60.6316H172.615V0H91.3846Z" fill="white"/>
              <path d="M81.2308 0H0V60.6316H81.2308V25.2632H60.9231V45.4737H40.6154V15.1579H81.2308V0Z" fill="white"/>
              <path d="M264 0H182.769V60.6316H264V25.2632H243.692V45.4737H223.385V15.1579H264V0Z" fill="white"/>
              <path d="M274.154 0H314.769V45.4737H335.077V0H355.385V60.6316H274.154V0Z" fill="white"/>
            </svg>
          </div>
          <Input
            autofocus
            showClear
            size="large"
            placeholder={t`label.username`}
            className="mt-16 hover:border-white focus-within:border-white"
            maxLength={16}
            value={username}
            onChange={(value) => setUsername(value.trim())}
          />
          <Input
            showClear
            size="large"
            type="password"
            placeholder={t`label.password`}
            className="mt-4 hover:border-white focus-within:border-white"
            maxLength={16}
            value={password}
            onChange={(value) => setPassword(value)}
            onKeyUp={(e: any) => e.key === 'Enter' && handleLogin()}
            suffix={(
              <button
                disabled={!username || !password}
                className="mr-2px w-8 h-8 rounded hover:bg-black-200 text-white flex justify-center items-center"
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
      <PublicFooter />
    </>
  )
}
