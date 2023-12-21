import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { formModeType } from '.'
import { FsApi, UserApi } from '../../../api'
import { Confirmor, SvgIcon } from '../../../components/common'
import { useRequest } from '../../../hooks'
import { IUser, IUserForm, User, UserValidityType, UserForm, UserPermission } from '../../../types'
import { getDateTime, getIsExpired } from '../../../utils'

const getTimestampSuffix = () => `?timestamp=${Date.now()}`

interface UserListProps {
  list: IUser[]
  loggedInList: string[]
  setForm: (form: IUserForm) => void
  setFormMode: (mode: formModeType) => void
  onRefresh: () => void
}

export default function UserList(props: UserListProps) {

  const {
    list: userList,
    loggedInList,
    setForm,
    setFormMode,
    onRefresh,
  } = props

  const { t } = useTranslation()

  const { request: updateUserValidity } = useRequest(UserApi.updateUserValidity)
  const { request: deleteUser } = useRequest(UserApi.deleteUser)

  const handleUpdateAbility = useCallback(async (username: User.Username, ability: UserValidityType) => {
    const { success } = await updateUserValidity(username, ability)
    if (success) {
      onRefresh()
    }
  }, [updateUserValidity, onRefresh])

  const handleRemove = useCallback(async (username: string) => {
    const { success } = await deleteUser(username)
    if (success) {
      onRefresh()
    }
  }, [onRefresh, deleteUser])

  const getButtonList = useCallback((user: IUser) => {
    const isAdmin = user.permissions.includes(UserPermission.administer)
    const buttonList = [
      {
        label: t`action.edit`,
        icon: <SvgIcon.Edit className="text-gray-500" />,
        show: true,
        onClick: () => {
          const avatarPath = FsApi.getAvatarStreamUrl(user.username) + getTimestampSuffix()
          setForm(new UserForm(user, avatarPath))
          setFormMode('EDIT')
        },
      },
      {
        label: t`action.disable`,
        icon: <SvgIcon.Forbid className="text-yellow-500" />,
        show: !isAdmin && !user.invalid,
        onClick: () => handleUpdateAbility(user.username, 'invalid'),
      },
      {
        label: t`action.enable`,
        icon: <SvgIcon.CheckCircle className="text-green-500" />,
        show: !isAdmin && user.invalid,
        onClick: () => handleUpdateAbility(user.username, 'valid'),
      },
      {
        label: t`action.delete`,
        icon: <SvgIcon.Delete className="text-red-500" />,
        show: true,
        onClick: () => {
          Confirmor({
            type: 'delete',
            content: (
              <div>
                <p className="font-bold">{t`tip.deleteUser`}</p>
                <p>{user.nickname} @{user.username}</p>
              </div>
            ),
            onConfirm: async close => {
              const isCurrentAdmin = user.permissions.includes(UserPermission.administer)
              const isOnlyOneAdmin = userList.filter(u => u.permissions.includes(UserPermission.administer)).length === 1

              if (isCurrentAdmin && isOnlyOneAdmin) {
                toast.error(t`tip.lastAdminCannotDelete`)
                return
              }
              await handleRemove(user.username)
              close()
            },
          })

        },
      },
    ].filter(b => b.show)
    return buttonList
  }, [setForm, setFormMode, handleUpdateAbility, handleRemove, userList, t])

  return (
    <>
      <div className="relative z-0 flex flex-wrap -mx-2">
        {userList.map((user) => {
          const { nickname, username, expiredAt, createdAt, invalid, permissions } = user
          const isLoggedIn = loggedInList.includes(username)
          const showExpire = !!expiredAt
          const isExpired = getIsExpired(expiredAt)
          return (
            <div
              key={username}
              className="relative mr-2 w-44 transition-shadow duration-200 group rounded border overflow-hidden select-none"
            >
              <div className="absolute z-10 top-0 right-0 m-1 scale-90 origin-top-right text-xs font-din">
                {isExpired && (
                  <span
                    className={`
                      inline-block mr-1 px-2 py-0 rounded-full select-none
                      border border-white text-red-500 bg-red-200
                    `}
                  >
                    {t`tip.expired`}
                  </span>
                )}
                {invalid && (
                  <span
                    className={`
                      inline-block px-2 py-0 rounded-full select-none
                      border border-white
                      text-yellow-600 bg-yellow-200
                    `}
                  >
                    {t`tip.disabled`}
                  </span>
                )}
              </div>
              <div
                className="w-full h-16 bg-center bg-cover filter blur-sm bg-gray-200 opacity-20"
                style={{ backgroundImage: `url("${FsApi.getAvatarStreamUrl(username)}${getTimestampSuffix()}")` }}
              />
              <div className="relative z-10 -mt-8 p-2">
                <div className="flex items-center">
                  <div
                    className="relative w-12 h-12 flex-shrink-0 rounded-full bg-cover bg-center bg-no-repeat bg-gray-300 border-2 border-white"
                    style={{ backgroundImage: `url("${FsApi.getAvatarStreamUrl(username)}${getTimestampSuffix()}")` }}
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
                <div className="mt-2 pb-4 min-h-[1.5rem] scale-90 origin-top-left font-din leading-none">
                  {permissions.map(p => (
                    <span
                      key={p}
                      className="inline-block mr-[2px] mb-[2px] px-1 py-0 text-xs text-blue-600 bg-blue-100 rounded select-none capitalize"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <div className="flex-shrink-0 text-xs leading-none font-din text-gray-400 text-center group-hover:opacity-0">
                  <p>{t('tip.createdAt', { time: getDateTime(createdAt) })}</p>
                  {showExpire && (
                    <p>{t('tip.expiredAt', { time: getDateTime(expiredAt) })}</p>
                  )}
                </div>
              </div>
              <div className="absolute z-10 right-0 bottom-0 left-0 pb-1 hidden group-hover:flex flex-grow justify-center items-center">
                {getButtonList(user).map(({ icon, label, onClick }) => (
                  <div
                    key={label}
                    title={label}
                    className="mx-1 w-6 h-6 cursor-pointer hover:opacity-70 flex justify-center items-center rounded"
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
