import md5 from 'md5'
import { useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { formModeType } from '.'
import { UserApi } from '../../../api'
import { SvgIcon } from '../../../components/base'
import { useFetch } from '../../../hooks'
import { IUserForm, UserPermission } from '../../../types'
import { getImageTypeBase64ByURL } from '../../../utils'
import { Button, Form } from '@douyinfe/semi-ui'

interface UserFormModalProps {
  form: IUserForm
  formMode: formModeType
  refresh: () => void
  setForm: (form: IUserForm) => void
  setFormMode: (mode: formModeType) => void
}

export default function UserFormModal(props: UserFormModalProps) {

  const {
    form,
    formMode,
    refresh,
    setForm,
    setFormMode,
  } = props

  const { fetch: addUser } = useFetch(UserApi.addUser)

  const fileInputRef = useRef<any>(null)

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
  }, [form, setForm])

  const handleSubmit = useCallback(async () => {
    const {
      avatar,
      nickname,
      username,
      password,
      disabled,
      expiredAt,
      permissionList,
      rootEntryPathList,
    } = form

    if (!username || !password) {
      toast.error('用户名、密码格式错误')
      return
    }

    const res = await addUser({
      avatar,
      nickname,
      username,
      password: md5(password),
      disabled,
      createdAt: 0,
      expiredAt,
      permissionList,
      rootEntryPathList,
    })

    if (res.success) {
      setFormMode('CLOSE')
      refresh()
      toast.success('OK_USER_CREATED')
    } else {
      toast.error(res.message)
    }
  }, [refresh, addUser, form, setFormMode])

  return (
    <>
      <div className="absolute z-10 inset-0 p-4 bg-white overflow-y-auto">
        <div className="flex">
          <div className="relative p-1 w-24 h-24 border-2 border-dashed border-gray-300 hover:border-blue-500 text-gray-500 rounded-lg flex justify-center items-center">
            <input
              ref={fileInputRef}
              type="file"
              className="absolute z-10 block w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
            {form.avatar ? (
              <div
                className="w-full h-full rounded-full bg-center bg-cover bg-no-repeat bg-gray-300"
                style={{ backgroundImage: `url("${form.avatar}")` }}
              />
            ) : (
              <SvgIcon.Avatar size={96} className="text-gray-200" />
            )}
          </div>
          <div className="ml-4 flex-grow">
            <Form
              initValues={form}
            >
              <Form.Input
                showClear
                label="Nickname"
                placeholder="Nickname"
                maxLength={16}
                field="nickname"
                onChange={value => setForm({ ...form, nickname: value.trim() })}
              />
              <Form.Input
                showClear
                label="Username"
                placeholder="Username"
                maxLength={16}
                field="username"
                onChange={value => setForm({ ...form, username: value.toLowerCase().trim() })}
              />
              <Form.Input
                showClear
                label="Password"
                placeholder="Password"
                type="password"
                maxLength={16}
                field="password"
                onChange={value => setForm({ ...form, password: value })}
              />
              <Form.DatePicker
                type="dateTime"
                label="ExpiredAt"
                field="expiredAt"
                className="w-full"
                onChange={date => setForm({ ...form, expiredAt: new Date(date as Date).getTime() })}
              />
              <Form.CheckboxGroup
                label="PermissionList"
                field="permissionList"
                options={[
                  { label: '系统管理', value: UserPermission.administer, extra: '关闭系统、系统设置、用户管理、日志' },
                  { label: '读取', value: UserPermission.read, extra: '读取文件、数据、缩略图、Exif 信息等', disabled: true, checked: true },
                  { label: '写入', value: UserPermission.write, extra: '新建文件夹、上传文件等' },
                  { label: '删除', value: UserPermission.delete, extra: '删除文件、文件夹' },
                ]}
                onChange={value => setForm({ ...form, permissionList: value })}
              >
              </Form.CheckboxGroup>
            </Form>
          </div>
        </div>
        <div className="flex justify-end sticky bottom-0">
          <Button
            type="tertiary"
            children="Cancel"
            onClick={() => setFormMode('CLOSE')}
          />
          &emsp;
          <Button
            theme="solid"
            type="primary"
            children={formMode === 'ADD' ? 'Add' : 'Modify'}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </>
  )
}