import { useNavigate } from 'react-router-dom'
import { useCallback, useState } from 'react'
import { useFetch } from '../hooks'
import { AuthApi } from '../api'
import md5 from 'md5'
import toast from 'react-hot-toast'
import { SvgIcon } from '../components/base'
import { TOKEN } from '../utils'
import { Input } from '@douyinfe/semi-ui'

export default function LoginPage() {

  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const { fetch: login, loading } = useFetch(AuthApi.login)

  const handleLogin = useCallback(async () => {
    const formData = {
      username,
      password: md5(password),
    }
    const res = await login(formData)
    if (res.success) {
      TOKEN.set(res.token)
      navigate('/')
    } else {
      toast.error(res.message)
    }
  }, [username, password, login, navigate])
  
  return (
    <>
      <div
        className="semi-always-dark fixed z-0 inset-0 overflow-hidden bg-gradient-to-br from-gray-500 to-black"
      >
        <div className="absolute inset-0 flex justify-center items-center backdrop-filter backdrop-blur-lg">
          <div className="w-56 ">
            <div className="text-white flex justify-center items-center">
              <SvgIcon.G size={64} />
            </div>
            <Input
              autofocus
              showClear
              placeholder="Username"
              className="mt-12"
              maxLength={16}
              value={username}
              onChange={(value) => setUsername(value.trim())}
            />
            <div className="relative mt-4">
              <Input
                showClear
                type="password"
                placeholder="Password"
                maxLength={16}
                value={password}
                onChange={(value) => setPassword(value)}
                onKeyUp={(e: any) => e.key === 'Enter' && handleLogin()}
                suffix={(
                  <button
                    disabled={!username || !password}
                    className="mr-2px w-6 h-6 rounded hover:bg-black-200 text-white flex justify-center items-center"
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
      </div>
    </>
  )
}
