import bg from '../img/bg.jpg'
import { useNavigate } from 'react-router-dom'
import { useCallback, useState } from 'react'
import useFetch from '../hooks/useFetch'
import { AuthApi } from '../api'
import md5 from 'md5'
import { GAGU_AUTH_KEY } from '../utils'
import { toast } from 'react-toastify'
import { SvgIcon } from '../components/base'


export default function LoginPage() {

  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const { fetch: login } = useFetch(AuthApi.login)

  const handleLogin = useCallback(async () => {
    const formData = {
      username,
      password: md5(password),
    }
    const res = await login(formData)
    if (res.success) {
      localStorage.setItem(GAGU_AUTH_KEY, res.authCode)
      navigate('/')
    } else {
      toast.error(res.msg)
    }
  }, [username, password, login, navigate])
  
  return (
    <>
      <div
        className="fixed z-0 inset-0 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url("${bg}")` }}
      >
        <div className="absolute inset-0 flex justify-center items-center backdrop-filter backdrop-blur-lg bg-black-100">
          <div className="w-56">
            <div className="text-white flex justify-center items-center">
              <div
                className="w-24 h-24 rounded-full bg-center bg-cover shadow-lg"
                style={{ backgroundImage: `url("${bg}")` }}
              />
            </div>
            <code>
              <input
                autoFocus
                placeholder="Username"
                className="px-3 py-2 w-full mt-6 text-sm outline-none bg-black-100 text-white placeholder-gray-400 border-b border-transparent focus:border-white"
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
                />
              </code>
              <button
                disabled={!username || !password}
                className="absolute top-0 right-0 px-3 h-full hover:bg-black-200"
                onClick={handleLogin}
              >
                <SvgIcon.ArrowRight className="text-white"/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
