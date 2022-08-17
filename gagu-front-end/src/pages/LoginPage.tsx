import bg from '../img/bg.jpg'
import { useNavigate } from 'react-router-dom'
import { useCallback, useState } from 'react'
import useFetch from '../hooks/useFetch'
import { AuthApi } from '../api'
import md5 from 'md5'
import { GAGU_AUTH_KEY } from '../utils'
import { toast } from 'react-toastify'
import RemixIcon from '../img/remixicon'


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
        <div className="absolute inset-0 flex justify-center items-center bg-hazy-100 bg-black-300">
          <div className="w-48">
            <div className="text-white flex justify-center items-center">
              <div
                className="w-24 h-24 rounded-full bg-center bg-cover shadow-lg"
                style={{ backgroundImage: `url("${bg}")` }}
              />
            </div>
            <input
              placeholder="用户名"
              className="px-2 py-1 w-full mt-6 text-sm outline-none"
              maxLength={16}
              value={username}
              onChange={(e: any) => setUsername(e.target.value.trim())}
            />
            <div className="relative mt-4">
              <input
                type="password"
                placeholder="密码"
                className="px-2 py-1 w-full text-sm outline-none"
                maxLength={16}
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
              />
              <button
                disabled={!username || !password}
                className="absolute top-0 right-0 w-8 h-full hover:bg-gray-100"
                onClick={handleLogin}
              >
                <RemixIcon.ArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
