import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { formModeType } from '.'
import { FsApi, UserApi } from '../../../api'
import { SvgIcon } from '../../../components/base'
import { useFetch } from '../../../hooks'
import { IUser, IUserForm, UserForm, UserPermission, UserPermissionType } from '../../../types'
import { getAtTime } from '../../../utils'

const sortMap = {
  [UserPermission.administer]: 0,
  [UserPermission.read]: 1,
  [UserPermission.write]: 2,
  [UserPermission.delete]: 3,
}

const permissionSorter = (prev: UserPermissionType, next: UserPermissionType) => {
  return sortMap[prev] > sortMap[next] ? 1 : -1
}

interface UserListProps {
  list: IUser[]
  loggedInList: string[]
  refresh: () => void
  setForm: (form: IUserForm) => void
  setFormMode: (mode: formModeType) => void
}

export default function UserList(props: UserListProps) {

  const {
    list,
    loggedInList,
    refresh,
    setForm,
    setFormMode,
  } = props

  const { fetch: removeUser } = useFetch(UserApi.removeUser)

  const handleRemove = useCallback(async (username: string) => {
    const res = await removeUser(username)
    if (res.success) {
      refresh()
      toast.success('OK_USER_DELETED')
    } else {
      toast.error(res.message)
    }
  }, [refresh, removeUser])

  const getButtonList = useCallback((user: IUser) => {
    const isAdmin = user.permissionList.includes(UserPermission.administer)
    const buttonList = [
      {
        label: '编辑',
        icon: <SvgIcon.Edit className="text-gray-500" />,
        show: false,
        onClick: () => {
          const avatarPath = FsApi.getAvatarStreamUrl(user.username)
          setForm(new UserForm(user, avatarPath))
          setFormMode('EDIT')
        },
      },
      {
        label: '禁用',
        icon: <SvgIcon.Forbid className="text-yellow-500" />,
        show: !isAdmin && !user.disabled && false,
        onClick: () => { },
      },
      {
        label: '启用',
        icon: <SvgIcon.CheckCircle className="text-green-500" />,
        show: !isAdmin && user.disabled && false,
        onClick: () => { },
      },
      {
        label: '删除',
        icon: <SvgIcon.Delete className="text-red-500" />,
        show: true, // !isAdmin,
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
  }, [handleRemove, setForm, setFormMode])

  return (
    <>
      {list.map((user) => {
        const { nickname, username, expiredAt, createdAt, disabled, permissionList } = user
        const isLoggedIn = loggedInList.includes(username)
        const showExpire = !!expiredAt
        return (
          <div
            key={username}
            className="p-2 flex justify-start items-center  odd:bg-gray-100 hover:bg-gray-200 group rounded"
          >
            <div
              className="relative w-10 h-10 flex-shrink-0 rounded-full bg-cover bg-center bg-no-repeat bg-gray-300 border-2 border-white"
              style={{ backgroundImage: `url("${FsApi.getAvatarStreamUrl(username)}")` }}
            >
              {isLoggedIn && (
                <div className="absolute top-0 right-0 -m-1px w-2 h-2 rounded bg-green-400 border border-white" />
              )}
            </div>
            <div className="ml-2 w-32 flex-shrink-0 leading-none">
              <div>
                <span className="text-sm">{nickname}</span>
                &nbsp;
                <span className="text-xs text-gray-400">@{username}</span>
              </div>
              {false ? (
                <span className="inline-block px-1 py-0 text-xs text-white bg-blue-600 rounded select-none transform scale-75 origin-top-left">
                  ADMIN
                </span>
              ) : (
                <span
                  className={`
                    inline-block px-2 py-0 rounded-full select-none
                    transform scale-90 origin-top-left
                    text-xs
                    ${disabled ? 'text-yellow-600 bg-yellow-200' : 'text-green-600 bg-green-200'}
                  `}
                >
                  {disabled ? 'Disabled' : 'Enabled'}
                </span>
              )}
            </div>
            <div className="flex-shrink-0 text-xs leading-none font-din text-gray-500">
              <p>{getAtTime(createdAt)} 创建</p>
              {showExpire && (
                <p>{getAtTime(expiredAt)} 过期</p>
              )}
              <div className="mt-1 transform scale-90 origin-top-left">
                {permissionList.sort(permissionSorter).map(p => (
                  <span
                    key={p}
                    className="inline-block mr-2px px-1 py-0 text-xs text-white bg-blue-600 rounded select-none capitalize"
                  >
                    {p}
                  </span>
                ))}
              </div>
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
    </>
  )
}
