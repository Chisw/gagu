import { useEffect, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { UserApi } from '../../../api'
import { IconButton, SvgIcon } from '../../../components/common'
import { useRequest } from '../../../hooks'
import { IUserForm, UserForm } from '../../../types'
import UserFormSheet from './UserFormSheet'
import UserList from './UserList'

export type FormModeType = 'CLOSE' | 'CREATE' | 'EDIT'

export default function UserPanel() {

  const { t } = useTranslation()

  const [formMode, setFormMode] = useState<FormModeType>('CLOSE')
  const [form, setForm] = useState<IUserForm>(new UserForm())
  const [refreshedTimestap, setRefreshedTimestamp] = useState(Date.now())

  const { request: queryUserList, data, loading } = useRequest(UserApi.queryUserList)

  const handleRefreshList = useCallback(() => {
    queryUserList()
    setRefreshedTimestamp(Date.now())
  }, [queryUserList])

  useEffect(() => {
    handleRefreshList()
  }, [handleRefreshList])

  const userList = useMemo(() => {
    return data?.data || []
  }, [data])

  return (
    <>
      <div className="gagu-app-settings-user-form absolute z-0 inset-0 px-3 md:px-4 py-2 overflow-x-hidden overflow-y-auto">

        <div className="text-sm flex justify-between items-center dark:text-zinc-200">
          <div>{t('tip.totalUsers', { count: userList.length })}</div>
          <div className="flex items-center">
            <IconButton
              title={t`action.refresh`}
              disabled={loading}
              icon={<SvgIcon.Refresh className={`text-blue-500 ${loading ? 'animate-spin' : ''}`} />}
              onClick={handleRefreshList}
            />
            <IconButton
              title={t`action.newUser`}
              icon={<SvgIcon.Add className="text-blue-500" />}
              onClick={() => {
                setForm(new UserForm())
                setFormMode('CREATE')
              }}
            />
          </div>
        </div>

        <div className="mt-2">
          <UserList
            {...{
              userList,
              setForm,
              setFormMode,
              refreshedTimestap,
            }}
            onRefresh={handleRefreshList}
          />
        </div>

      </div>

      <UserFormSheet
        {...{
          formMode,
          form,
          setForm,
          setFormMode,
        }}
        onRefresh={handleRefreshList}
      />
    </>
  )
}
