import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserApi } from '../../../api'
import { SvgIcon } from '../../../components/common'
import { useRequest } from '../../../hooks'
import { IUserForm, UserForm } from '../../../types'
import UserFormSheet from './UserFormSheet'
import UserList from './UserList'

export type formModeType = 'CLOSE' | 'CREATE' | 'EDIT'

export default function UserPanel() {

  const { t } = useTranslation()

  const [formMode, setFormMode] = useState<formModeType>('CLOSE')
  const [form, setForm] = useState<IUserForm>(new UserForm())

  const { request: handleRefresh, data } = useRequest(UserApi.queryUserList)

  useEffect(() => {
    handleRefresh()
  }, [handleRefresh])

  const { userList, loggedInList } = useMemo(() => {
    const userList = data?.data?.userList || []
    const loggedInList = data?.data?.loggedInList || []
    return { userList, loggedInList }
  }, [data])

  return (
    <>
      <div className="gagu-app-settings-user-form absolute z-0 inset-0 px-4 py-2 overflow-x-hidden overflow-y-auto">

        <div className="text-sm flex justify-between items-center dark:text-zinc-200">
          <div>{t('tip.totalUsers', { count: userList.length })}</div>
          <div className="flex items-center">
            <div
              title={t`action.refresh`}
              className="w-6 h-6 cursor-pointer hover:bg-gray-100 flex justify-center items-center rounded"
              onClick={handleRefresh}
            >
              <SvgIcon.Refresh className="text-gray-500" />
            </div>
            <div
              title={t`action.newUser`}
              className="w-6 h-6 cursor-pointer hover:bg-gray-100 flex justify-center items-center rounded"
              onClick={() => {
                setForm(new UserForm())
                setFormMode('CREATE')
              }}
            >
              <SvgIcon.Add className="text-blue-500" />
            </div>
          </div>
        </div>

        <div className="mt-2">
          <UserList
            list={userList}
            loggedInList={loggedInList}
            {...{
              setForm,
              setFormMode,
            }}
            onRefresh={handleRefresh}
          />
        </div>

      </div>

      <UserFormSheet
        {...{
          form,
          formMode,
          setForm,
          setFormMode,
        }}
        onRefresh={handleRefresh}
      />
    </>
  )
}
