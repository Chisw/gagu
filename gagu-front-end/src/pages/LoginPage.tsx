import bg from '../img/bg.jpg'
import { useNavigate } from 'react-router-dom'
import { Button, InputGroup } from '@blueprintjs/core'
import { useCallback, useState } from 'react'
import useFetch from '../hooks/useFetch'
import { AuthApi } from '../api'
import md5 from 'md5'
import { GAGU_AUTH_CODE_KEY } from '../utils'
import Toast from '../components/EasyToast'


export default function LoginPage() {

  const navigate = useNavigate()
  const [username, setUsername] = useState('chisw')
  const [password, setPassword] = useState('')

  const { fetch: login } = useFetch(AuthApi.login)

  const handleLogin = useCallback(async () => {
    const formData = {
      username,
      password: md5(password),
    }
    const res = await login(formData)
    if (res.success) {
      localStorage.setItem(GAGU_AUTH_CODE_KEY, res.authCode)
      navigate('/public')
    } else {
      Toast.danger(res.msg)
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
            <InputGroup
              leftIcon="user"
              placeholder="账户"
              className="mt-6"
              value={username}
              onChange={(e: any) => setUsername(e.target.value.trim())}
            />
            <InputGroup
              type="password"
              leftIcon="key"
              placeholder="密码"
              className="mt-4"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              rightElement={(
                <Button
                  icon="arrow-right"
                  onClick={handleLogin}
                />
              )}
            />
          </div>
        </div>
      </div>
    </>
  )
}
