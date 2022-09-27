import md5 from 'md5'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { IPanelProps } from '.'
import { AuthApi, FsApi } from '../../api'
import { SvgIcon } from '../../components/base'
import { useFetch } from '../../hooks'
import { IUser } from '../../types'
import { getAtTime } from '../../utils'

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

  const { fetch: getUserList, data, loading } = useFetch(AuthApi.getUserList)
  const { fetch: addUser } = useFetch(AuthApi.addUser)
  const { fetch: removeUser } = useFetch(AuthApi.removeUser)

  useEffect(() => {
    getUserList()
  }, [getUserList])

  useEffect(() => {
    setWindowLoading(loading)
  }, [setWindowLoading, loading])

  const userList = useMemo(() => {
    const userList: IUser[] = data?.rows || []
    return userList
  }, [data])

  const handleSubmit = useCallback(async () => {
    const { username, password } = form
    if (!username || !password) {
      toast.error('用户名、密码格式错误')
      return
    }
    const res = await addUser({
      username,
      password: md5(password),
    })
    if (res.success) {
      setFormMode('close')
      getUserList()
      toast.success('OK_USER_CREATED')
    } else {
      toast.error(res.msg)
    }
  }, [getUserList, addUser, form])

  const handleRemove = useCallback(async (username: string) => {
    const res = await removeUser(username)
    if (res.success) {
      getUserList()
      toast.success('OK_USER_DELETED')
    } else {
      toast.error(res.msg)
    }
  }, [getUserList, removeUser])

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
        show: !user.isAdmin,
        onClick: () => {},
      },
      {
        label: '启用',
        icon: <SvgIcon.CheckCircle className="text-green-500" />,
        show: !user.isAdmin,
        onClick: () => {},
      },
      {
        label: '删除',
        icon: <SvgIcon.Delete className="text-red-500" />,
        show: !user.isAdmin,
        onClick: () => handleRemove(user.username),
      },
    ].filter(b => b.show)
    return buttonList
  }, [handleRemove])

  return (
    <>
      <div className="absolute z-0 inset-0 px-2 py-1">

        <div className="text-sm flex justify-between items-center">
          <div>共 {userList.length} 位用户</div>
          <div className="flex">
            <div
              title="刷新"
              className="w-6 h-6 cursor-pointer hover:bg-gray-100 flex justify-center items-center rounded"
              onClick={getUserList}
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
            return (
              <div
                key={username}
                className="p-2 flex justify-start items-center  odd:bg-gray-100 hover:bg-blue-100 group rounded"
              >
                <div
                  className="w-8 h-8 flex-shrink-0 rounded-full bg-cover bg-center bg-no-repeat bg-blue-300"
                  style={{ backgroundImage: `url("${FsApi.getUserAvatarStreamUrl(username)}")` }}
                />
                <div className="ml-2 w-20 flex-shrink-0 leading-none">
                  <p>{username}</p>
                  {isAdmin && (
                    <span className="inline-block px-1 py-0 text-xs text-white bg-blue-600 rounded select-none transform scale-75 origin-left">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="flex-shrink-0 text-xs leading-none">
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
            <span>Username</span>
            <input
              placeholder="Username"
              className="border"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().trim() })}
            />
            <span>Password</span>
            <input
              placeholder="Password"
              className="border"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value.trim() })}
            />
            <input
              type="button"
              value="提交"
              onClick={handleSubmit}
            />
            <input
              type="button"
              value="取消"
              onClick={() => setFormMode('close')}
            />
          </div>
        </div>
      )}
    </>
  ) 
}