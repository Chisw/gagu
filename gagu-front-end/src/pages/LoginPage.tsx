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

export default function LoginPage() {

  const navigate = useNavigate()
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
      toast.error(res.message)
    }
  }, [username, password, login, setUserInfo, navigate])
  
  return (
    <>
      <div className="fixed z-0 inset-0 overflow-hidden bg-gradient-to-b from-gray-800 to-gray-600">
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="semi-always-dark w-64">
            <div className="text-white flex justify-center items-center">
              <SvgIcon.G size={64} />
            </div>
            <Input
              autofocus
              showClear
              size="large"
              placeholder="Username"
              className="mt-12 hover:border-white focus-within:border-white"
              maxLength={16}
              value={username}
              onChange={(value) => setUsername(value.trim())}
            />
            <Input
              showClear
              size="large"
              type="password"
              placeholder="Password"
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
        <div className="absolute bottom-0 py-4 w-full text-center text-xs text-white">
          <a
            rel="noreferrer"
            href="https://gagu.io"
            target="_blank"
            className="opacity-50 hover:opacity-70 font-g"
          >
            GAGU.IO
          </a>
        </div>
      </div>
    </>
  )
}
