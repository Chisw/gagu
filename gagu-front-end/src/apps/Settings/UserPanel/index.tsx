import { useEffect, useMemo, useState } from 'react'
import { IPanelProps } from '..'
import { UserApi } from '../../../api'
import { SvgIcon } from '../../../components/base'
import { useFetch } from '../../../hooks'
import { IUser, IUserForm, User, UserForm } from '../../../types'
import UserFormSheet from './UserFormSheet'
import UserList from './UserList'

export type formModeType = 'CLOSE' | 'CREATE' | 'EDIT'

export default function UserPanel(props: IPanelProps) {

  const {
    setWindowLoading,
  } = props

  const [formMode, setFormMode] = useState<formModeType>('CLOSE')
  const [form, setForm] = useState<IUserForm>(new UserForm())

  const { fetch: refresh, data, loading } = useFetch(UserApi.getUserData)

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    setWindowLoading(loading)
  }, [setWindowLoading, loading])

  const { userList, loggedInList } = useMemo(() => {
    const userList: IUser[] = data?.userList || []
    const loggedInList: User.Username[] = data?.loggedInList || []
    return { userList, loggedInList }
  }, [data])

  return (
    <>
      <div className="gg-app-settings-user-form absolute z-0 inset-0 px-2 py-1 overflow-x-hidden overflow-y-auto">
        <div className="mx-auto max-w-md">

          <div className="text-sm flex justify-between items-center">
            <div>共 {userList.length} 位用户</div>
            <div className="flex items-center">
              <div
                title="刷新"
                className="w-6 h-6 cursor-pointer hover:bg-gray-100 flex justify-center items-center rounded"
                onClick={refresh}
              >
                <SvgIcon.Refresh className="text-gray-500" />
              </div>
              <div
                title="新增用户"
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
              refresh={refresh}
              setForm={setForm}
              setFormMode={setFormMode}
            />
          </div>

        </div>
      </div>

      <UserFormSheet
        form={form}
        formMode={formMode}
        refresh={refresh}
        setForm={setForm}
        setFormMode={setFormMode}
      />
    </>
  )
}
