import { useNavigate } from 'react-router-dom'
import { useCallback, useState } from 'react'
import { useFetch } from '../hooks'
import { AuthApi } from '../api'
import md5 from 'md5'
import toast from 'react-hot-toast'
import { SvgIcon } from '../components/base'
import { TOKEN } from '../utils'

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
        className="fixed z-0 inset-0 overflow-hidden bg-gradient-to-br from-gray-400 to-gray-900"
      >
        <div className="absolute inset-0 flex justify-center items-center backdrop-filter backdrop-blur-lg">
          <div className="w-56">
            <div className="text-white flex justify-center items-center">
              <SvgIcon.G size={64} />
            </div>
            <code>
              <input
                autoFocus
                placeholder="Username"
                className="mt-12 px-3 py-2 w-full text-sm outline-none bg-black-100 text-white placeholder-gray-400 border-b border-transparent focus:border-white"
                maxLength={16}
                value={username}
                onChange={(e: any) => setUsername(e.target.value.trim())}
              />
            </code>
            <div className="relative mt-4">
              <code>
                <input
                  type="password"
                  placeholder="Password"
                  className="px-3 py-2 w-full text-sm outline-none bg-black-100 text-white placeholder-gray-400 border-b border-transparent focus:border-white"
                  maxLength={16}
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  onKeyUp={(e: any) => e.key === 'Enter' && handleLogin()}
                />
              </code>
              <button
                disabled={!username || !password}
                className="absolute top-0 right-0 px-3 h-full hover:bg-black-200"
                onClick={handleLogin}
              >
                {loading
                  ? <SvgIcon.Loader className="text-white"/>
                  : <SvgIcon.ArrowRight className="text-white"/>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
