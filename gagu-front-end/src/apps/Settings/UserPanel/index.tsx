import { useEffect, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { UserApi } from '../../../api'
import { SvgIcon } from '../../../components/common'
import { useRequest } from '../../../hooks'
import UserFormSheet from './UserFormSheet'
import UserList from './UserList'
import { Button } from '@douyinfe/semi-ui'
import { IUserForm, UserForm } from '@shared'

export type FormModeType = 'CLOSE' | 'CREATE' | 'EDIT'

export default function UserPanel() {

  const { t } = useTranslation()

  const [formMode, setFormMode] = useState<FormModeType>('CLOSE')
  const [form, setForm] = useState<IUserForm>(new UserForm())
  const [refreshedTimestamp, setRefreshedTimestamp] = useState(Date.now())

  const { request: queryUserList, loading, response } = useRequest(UserApi.queryUserList)

  const handleRefreshList = useCallback(() => {
    queryUserList()
    setRefreshedTimestamp(Date.now())
  }, [queryUserList])

  useEffect(() => {
    handleRefreshList()
  }, [handleRefreshList])

  const userList = useMemo(() => {
    return response?.data || []
  }, [response])

  return (
    <>
      <div className="gagu-app-settings-user-form absolute z-0 inset-0 px-3 md:px-4 py-2 overflow-x-hidden overflow-y-auto">

        <div className="text-sm flex justify-between items-center dark:text-zinc-200">
          <div>{t('tip.totalUsers', { count: userList.length })}</div>
          <div className="flex items-center">
            <Button
              title={t`action.refresh`}
              className="mr-1"
              loading={loading}
              icon={<SvgIcon.Refresh />}
              onClick={handleRefreshList}
            />
            <Button
              title={t`action.newUser`}
              icon={<SvgIcon.Add />}
              onClick={() => {
                setForm(new UserForm())
                setFormMode('CREATE')
              }}
            />
          </div>
        </div>

        <div className="mt-2">
          <UserList
            userList={userList}
            setForm={setForm}
            setFormMode={setFormMode}
            refreshedTimestamp={refreshedTimestamp}
            onRefresh={handleRefreshList}
          />
        </div>

      </div>

      <UserFormSheet
        formMode={formMode}
        form={form}
        setForm={setForm}
        setFormMode={setFormMode}
        onRefresh={handleRefreshList}
      />
    </>
  )
}
