import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { FormModeType } from '.'
import { FsApi, UserApi } from '../../../api'
import { Confirmor, SvgIcon } from '../../../components/common'
import { useRequest } from '../../../hooks'
import { IUser, IUserForm, User, UserValidityType, UserForm, UserPermission } from '../../../types'
import { getDateTime, getIsExpired, getTimestampParam, line } from '../../../utils'

interface UserListProps {
  userList: IUser[]
  setForm: (form: IUserForm) => void
  setFormMode: (mode: FormModeType) => void
  refreshedTimestap: number
  onRefresh: () => void
}

export default function UserList(props: UserListProps) {

  const {
    userList,
    setForm,
    setFormMode,
    refreshedTimestap,
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
        icon: <SvgIcon.Edit className="text-gray-500 dark:text-zinc-300" />,
        show: true,
        onClick: () => {
          const avatarPath = FsApi.getPublicAvatarStreamUrl(user.username) + '?' + getTimestampParam()
          setForm(new UserForm(user, avatarPath))
          setFormMode('EDIT')
        },
      },
      {
        label: t`action.disable`,
        icon: <SvgIcon.Forbid className="text-yellow-500" />,
        show: !isAdmin && !user.invalid && !getIsExpired(user.expiredAt),
        onClick: () => handleUpdateAbility(user.username, 'invalid'),
      },
      {
        label: t`action.enable`,
        icon: <SvgIcon.CheckCircle className="text-green-500" />,
        show: !isAdmin && user.invalid && !getIsExpired(user.expiredAt),
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
      <div className="relative z-0 flex flex-wrap">
        {userList.map((user) => {
          const { nickname, username, expiredAt, createdAt, pulsedAt, invalid, permissions } = user
          const isActive = pulsedAt && (Date.now() - pulsedAt < 5 * 60 * 1000)
          const showExpire = !!expiredAt
          const isExpired = getIsExpired(expiredAt)
          const avatarStyle = { backgroundImage: `url("${FsApi.getPublicAvatarStreamUrl(username)}?${getTimestampParam(refreshedTimestap)}")` }

          return (
            <div
              key={username}
              className={line(`
                relative mr-2 mb-2 w-44 rounded bg-zinc-100
                transition-shadow duration-200 overflow-hidden select-none
                dark:bg-zinc-700 
              `)}
            >
              <div className="absolute z-10 top-0 right-0 m-1 scale-90 origin-top-right text-xs font-din">
                {isExpired && (
                  <span
                    className={`
                      inline-block mr-1 px-2 py-0 rounded-full select-none
                      border border-white text-red-500 bg-red-200
                      dark:text-red-200 dark:bg-red-500 dark:border-red-400
                    `}
                  >
                    {t`tip.expired`}
                  </span>
                )}
                {!isExpired && invalid && (
                  <span
                    className={`
                      inline-block px-2 py-0 rounded-full select-none
                      border border-white
                      text-yellow-600 bg-yellow-200
                      dark:text-yellow-200 dark:bg-yellow-600 dark:border-yellow-500
                    `}
                  >
                    {t`tip.disabled`}
                  </span>
                )}
              </div>
              <div
                className="w-full h-24 bg-center bg-cover filter blur-sm bg-gray-200 opacity-20"
                style={avatarStyle}
              />
              <div className="relative z-10 -mt-20">
                <div className="flex justify-center items-center">
                  <div
                    className="relative w-12 h-12 flex-shrink-0 rounded-full bg-cover bg-center bg-no-repeat bg-gray-300 border-2 border-white shadow dark:border-zinc-500"
                    style={avatarStyle}
                  >
                    {isActive && (
                      <div className="absolute top-0 right-0 w-2 h-2 rounded bg-green-400 border border-white" />
                    )}
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-bold dark:text-zinc-100">{nickname}</div>
                  <div className="text-xs text-gray-400 dark:text-zinc-300">@{username}</div>
                </div>
                <div className="py-2 text-center font-din leading-none">
                  {permissions.map(p => (
                    <span
                      key={p}
                      className={line(`
                        inline-block mx-[1px] px-1 py-0
                        text-xs text-blue-600 bg-blue-100 rounded select-none capitalize
                        dark:text-blue-200 dark:bg-blue-600
                      `)}
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <div className="flex-shrink-0 min-h-[30px] text-xs leading-none font-din text-gray-400 text-center">
                  <p>{t('tip.createdAt', { time: getDateTime(createdAt) })}</p>
                  {showExpire && (
                    <p className="mt-1">{t('tip.expiredAt', { time: getDateTime(expiredAt) })}</p>
                  )}
                </div>
              </div>
              <div className="py-1 flex flex-grow justify-center items-center">
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
