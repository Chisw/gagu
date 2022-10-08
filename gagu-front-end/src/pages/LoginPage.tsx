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
      <div className="fixed z-0 inset-0 overflow-hidden bg-gradient-to-br from-gray-500 to-black">
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="semi-always-dark w-56">
            <div className="text-white flex justify-center items-center">
              <SvgIcon.G size={64} />
            </div>
            <Input
              autofocus
              showClear
              placeholder="Username"
              className="mt-12 hover:border-white focus-within:border-white"
              maxLength={16}
              value={username}
              onChange={(value) => setUsername(value.trim())}
            />
            <Input
              showClear
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
        <div className="absolute bottom-0 py-4 w-full text-center text-xs text-white">
          <a
            rel="noreferrer"
            href="https://gagu.io"
            target="_blank"
            className="underline opacity-50 hover:opacity-70"
          >
            https://gagu.io
          </a>
        </div>
      </div>
    </>
  )
}
