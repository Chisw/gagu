import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { formModeType } from '.'
import { FsApi, UserApi } from '../../../api'
import { Confirmor, SvgIcon } from '../../../components/base'
import { useFetch } from '../../../hooks'
import { IUser, IUserForm, User, UserAbilityType, UserForm, UserPermission } from '../../../types'
import { getDateTime, getIsExpired } from '../../../utils'

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

  const { fetch: updateUserAbility } = useFetch(UserApi.updateUserAbility)
  const { fetch: removeUser } = useFetch(UserApi.removeUser)

  const handleUpdateAbility = useCallback(async (username: User.Username, ability: UserAbilityType) => {
    const res = await updateUserAbility(username, ability)
    if (res.success) {
      refresh()
      toast.success(res.message)
    } else {
      toast.error(res.message)
    }
  }, [updateUserAbility, refresh])

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
    const isAdmin = user.permissions.includes(UserPermission.administer)
    const buttonList = [
      {
        label: '编辑',
        icon: <SvgIcon.Edit className="text-gray-500" />,
        show: true,
        onClick: () => {
          const avatarPath = FsApi.getAvatarStreamUrl(user.username)
          setForm(new UserForm(user, avatarPath))
          setFormMode('EDIT')
        },
      },
      {
        label: '禁用',
        icon: <SvgIcon.Forbid className="text-yellow-500" />,
        show: !isAdmin && !user.disabled,
        onClick: () => handleUpdateAbility(user.username, 'disable'),
      },
      {
        label: '启用',
        icon: <SvgIcon.CheckCircle className="text-green-500" />,
        show: !isAdmin && user.disabled,
        onClick: () => handleUpdateAbility(user.username, 'enable'),
      },
      {
        label: '删除',
        icon: <SvgIcon.Delete className="text-red-500" />,
        show: true, // !isAdmin,
        onClick: () => {
          Confirmor({
            type: 'delete',
            content: (
              <div>
                <p className="font-bold">Sure to delete this user?</p>
                <p>{user.nickname} @{user.username}</p>
              </div>
            ),
            onConfirm: async close => {
              await handleRemove(user.username)
              close()
            },
          })

        },
      },
    ].filter(b => b.show)
    return buttonList
  }, [setForm, setFormMode, handleUpdateAbility, handleRemove])

  return (
    <>
      <div className="relative z-0 flex flex-wrap -mx-2">
        {list.map((user) => {
          const { nickname, username, expiredAt, createdAt, disabled, permissions } = user
          const isLoggedIn = loggedInList.includes(username)
          const showExpire = !!expiredAt
          const isExpired = getIsExpired(expiredAt)
          return (
            <div
              key={username}
              className="relative m-2 w-48 transition-shadow duration-200 hover:shadow-lg group rounded-lg border overflow-hidden"
            >
              <div className="absolute z-10 top-0 right-0 m-1 transform scale-90 origin-top-right text-xs font-din">
                {isExpired && (
                  <span
                    className={`
                      inline-block mr-1 px-2 py-0 rounded-full select-none
                      border border-white text-red-500 bg-red-200
                    `}
                  >
                    Expired
                  </span>
                )}
                {disabled && (
                  <span
                    className={`
                      inline-block px-2 py-0 rounded-full select-none
                      border border-white
                      text-yellow-600 bg-yellow-200
                    `}
                  >
                    Disabled
                  </span>
                )}
              </div>
              <div
                className="w-full h-16 bg-center bg-cover filter blur-sm bg-gray-200 opacity-20"
                style={{ backgroundImage: `url("${FsApi.getAvatarStreamUrl(username)}")` }}
              />
              <div className="relative z-10 -mt-8 p-2">
                <div className="flex items-center">
                  <div
                    className="relative w-12 h-12 flex-shrink-0 rounded-full bg-cover bg-center bg-no-repeat bg-gray-300 border-2 border-white"
                    style={{ backgroundImage: `url("${FsApi.getAvatarStreamUrl(username)}")` }}
                  >
                    {isLoggedIn && (
                      <div className="absolute top-0 right-0 w-2 h-2 rounded bg-green-400 border border-white" />
                    )}
                  </div>
                  <div className="ml-2">
                    <div className="text-sm font-bold">{nickname}</div>
                    <div className="text-xs text-gray-400">@{username}</div>
                  </div>
                </div>
                <div className="mt-2 min-h-6 transform scale-90 origin-top-left font-din leading-none">
                  {permissions.map(p => (
                    <span
                      key={p}
                      className="inline-block mr-2px mb-2px px-1 py-0 text-xs text-blue-600 bg-blue-100 rounded select-none capitalize"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <div className="mt-2 min-h-6 transform scale-90 origin-top-left leading-none">
                </div>
                <div className="flex-shrink-0 text-xs leading-none font-din text-gray-400 text-center group-hover:opacity-0">
                  <p>{getDateTime(createdAt)} 创建</p>
                  {showExpire && (
                    <p>{getDateTime(expiredAt)} 过期</p>
                  )}
                </div>
              </div>
              <div className="absolute z-10 right-0 bottom-0 left-0 pb-1 hidden group-hover:flex flex-grow justify-center items-center">
                {getButtonList(user).map(({ icon, label, onClick }) => (
                  <div
                    key={label}
                    title={label}
                    className="w-6 h-6 cursor-pointer hover:opacity-70 flex justify-center items-center rounded"
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
    </>
  )
}
