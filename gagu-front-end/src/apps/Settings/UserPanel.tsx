import md5 from 'md5'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { IPanelProps } from '.'
import { AuthApi, FsApi } from '../../api'
import { SvgIcon } from '../../components/base'
import { useFetch } from '../../hooks'
import { IUser, User, UserStatus } from '../../types'
import { getAtTime, getImageTypeBase64ByURL } from '../../utils'

const newForm = () => {
  return {
    avatar: '',
    username: '',
    password: '',
  }
}

export default function UserPanel(props: IPanelProps) {

  const {
    setWindowLoading,
  } = props

  const [formMode, setFormMode] = useState<'close' | 'add' | 'edit'>('close')
  const [form, setForm] = useState(newForm())

  const fileInputRef = useRef<any>(null)

  const { fetch: getAuthData, data, loading } = useFetch(AuthApi.getAuthData)
  const { fetch: addUser } = useFetch(AuthApi.addUser)
  const { fetch: removeUser } = useFetch(AuthApi.removeUser)

  useEffect(() => {
    if (formMode === 'close') {
      setForm(newForm())
    }
  }, [formMode])

  useEffect(() => {
    getAuthData()
  }, [getAuthData])

  useEffect(() => {
    setWindowLoading(loading)
  }, [setWindowLoading, loading])

  const { userList, loggedInUsernameList } = useMemo(() => {
    const userList: IUser[] = data?.userList || []
    const loggedInUsernameList: User.Username[] = data?.loggedInUsernameList || []
    return { userList, loggedInUsernameList }
  }, [data])

  const handleFileChange = useCallback(() => {
    const file = fileInputRef?.current?.files[0]
    if (file) {
      if (!/image\/\w+/.test(file.type)) {
        toast.error('ERROR_SELECT_IMAGE_FIRST')
        return
      }
      const FR = new FileReader()
      FR.readAsDataURL(file)
      FR.onload = async e => {
        const base64 = e.target?.result as string
        const avatar = await getImageTypeBase64ByURL(base64, { width: 200, height: 200 }) as string
        setForm({ ...form, avatar })
      }
    }
  }, [form])

  const handleSubmit = useCallback(async () => {
    const { avatar, username, password } = form
    if (!username || !password) {
      toast.error('用户名、密码格式错误')
      return
    }
    const res = await addUser({
      avatar,
      username,
      password: md5(password),
    })
    if (res.success) {
      setFormMode('close')
      getAuthData()
      toast.success('OK_USER_CREATED')
    } else {
      toast.error(res.msg)
    }
  }, [getAuthData, addUser, form])

  const handleRemove = useCallback(async (username: string) => {
    const res = await removeUser(username)
    if (res.success) {
      getAuthData()
      toast.success('OK_USER_DELETED')
    } else {
      toast.error(res.msg)
    }
  }, [getAuthData, removeUser])

  const getButtonList = useCallback((user: IUser) => {
    const buttonList = [
      {
        label: '编辑',
        icon: <SvgIcon.Edit className="text-gray-500" />,
        show: true,
        onClick: () => {},
      },
      {
        label: '禁用',
        icon: <SvgIcon.Forbid className="text-yellow-500" />,
        show: !user.isAdmin && user.status === UserStatus.normal,
        onClick: () => {},
      },
      {
        label: '启用',
        icon: <SvgIcon.CheckCircle className="text-green-500" />,
        show: !user.isAdmin && user.status === UserStatus.forbidden,
        onClick: () => {},
      },
      {
        label: '删除',
        icon: <SvgIcon.Delete className="text-red-500" />,
        show: !user.isAdmin,
        onClick: () => toast((t) => (
          <div className="">
            <div className="py-8 w-56 text-center text-sm">
              <SvgIcon.Delete size={24} className="inline-block" />
              <p className="mt-4 font-medium text-gray-900">
                Sure to delete this user?
              </p>
              <p className="text-gray-500">
                User: {user.username}
              </p>
            </div>
            <div className="py-2 flex">
              <button
                className="py-1 w-full border-transparent flex items-center justify-center text-sm font-medium rounded text-gray-600 hover:text-gray-500 hover:bg-gray-100"
                onClick={() => toast.dismiss(t.id)}
              >
                Cancel
              </button>
              <button
                className="ml-2 py-1 w-full border-transparent flex items-center justify-center text-sm font-medium rounded text-red-600 hover:text-red-500 hover:bg-red-100"
                onClick={() => {
                  handleRemove(user.username)
                  toast.dismiss(t.id)
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ), { duration: 10 * 1000 })
      },
    ].filter(b => b.show)
    return buttonList
  }, [handleRemove])

  return (
    <>
      <div className="absolute z-0 inset-0 px-2 py-1">

        <div className="text-sm flex justify-between items-center">
          <div>共 {userList.length} 位用户</div>
          <div className="flex items-center">
            <div
              title="刷新"
              className="w-6 h-6 cursor-pointer hover:bg-gray-100 flex justify-center items-center rounded"
              onClick={getAuthData}
            >
              <SvgIcon.Refresh className="text-gray-500" />
            </div>
            <div
              title="新增用户"
              className="w-6 h-6 cursor-pointer hover:bg-gray-100 flex justify-center items-center rounded"
              onClick={() => setFormMode('add')}
            >
              <SvgIcon.Add className="text-blue-500" />
            </div>
          </div>
        </div>

        <div className="mt-2">
          {userList.map((user) => {
            const { isAdmin, username, createdAt, expiredAt } = user
            const isLoggedIn = loggedInUsernameList.includes(username)
            return (
              <div
                key={username}
                className="p-2 flex justify-start items-center  odd:bg-gray-100 hover:bg-gray-200 group rounded"
              >
                <div
                  className="relative w-8 h-8 flex-shrink-0 rounded-full bg-cover bg-center bg-no-repeat bg-blue-300"
                  style={{ backgroundImage: `url("${FsApi.getUserAvatarStreamUrl(username)}")` }}
                >
                  {isLoggedIn && (
                    <div className="absolute top-0 right-0 -m-1px w-2 h-2 rounded bg-green-400 border border-white" />
                  )}
                </div>
                <div className="ml-2 w-20 flex-shrink-0 leading-none">
                  <p>{username}</p>
                  {isAdmin && (
                    <span className="inline-block px-1 py-0 text-xs text-white bg-blue-600 rounded select-none transform scale-75 origin-left">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="flex-shrink-0 text-xs leading-none font-din text-gray-400">
                  <p>{getAtTime(createdAt)} 创建</p>
                  <p>{getAtTime(expiredAt)} 过期</p>
                </div>
                <div className="hidden group-hover:flex flex-grow justify-end items-center">
                  {getButtonList(user).map(({ icon, label, onClick }) => (
                    <div
                      key={label}
                      title={label}
                      className="w-6 h-6 cursor-pointer hover:bg-white flex justify-center items-center rounded"
                      onClick={onClick}
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

      </div>

      {(formMode !== 'close') && (
        <div
          className="absolute z-10 inset-0 p-4 bg-white"
        >
          <div className="flex flex-col">
            <div className="relative mx-auto p-1 w-24 h-24 border-2 border-dashed border-gray-300 hover:border-blue-500 text-gray-500 rounded-full flex justify-center items-center">
              <input
                ref={fileInputRef}
                type="file"
                className="absolute z-10 block w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              {form.avatar ? (
                <img src={form.avatar} alt="icon" className="w-full h-full rounded-full" />
              ) : (
                <SvgIcon.Avatar size={96} className="text-gray-200" />
              )}
            </div>
            <p className="text-sm text-gray-500 font-din">Username</p>
            <input
              placeholder="Username"
              className="mt-1 mb-2 px-2 py-1 border rounded-sm"
              maxLength={16}
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().trim() })}
            />
            <p className="text-sm text-gray-500 font-din">Password</p>
            <input
              placeholder="Password"
              type="password"
              className="mt-1 mb-2 px-2 py-1 border rounded-sm"
              maxLength={16}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value.trim() })}
            />
            <div className="flex justify-end">
              <input
                type="button"
                className="mr-2 px-2 py-1 min-w-16 rounded-sm cursor-pointer bg-gray-200 hover:bg-gray-100 active:bg-gray-300"
                value="Cancel"
                onClick={() => setFormMode('close')}
              />
              <input
                type="button"
                className="px-2 py-1 min-w-16 rounded-sm cursor-pointer bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white"
                value="Add"
                onClick={handleSubmit}
              />
            </div>
          </div>
        </div>
      )}
    </>
  ) 
}