import md5 from 'md5'
import { useCallback, useMemo, useRef } from 'react'
import toast from 'react-hot-toast'
import { formModeType } from '.'
import { UserApi } from '../../../api'
import { SvgIcon } from '../../../components/base'
import { useRequest } from '../../../hooks'
import { IUserForm, UserPermission } from '../../../types'
import { getImageTypeBase64ByURL, line, permissionSorter } from '../../../utils'
import { Button, Form, SideSheet } from '@douyinfe/semi-ui'
import { useTranslation } from 'react-i18next'

const handleScrollToError = () => {
  const top = document.querySelector('.gagu-app-settings-user-form .semi-form-field-error-message')?.closest('.semi-form-field')?.getBoundingClientRect()?.top
  if (top) {
    document.querySelector('.gagu-app-settings-user-form .semi-sidesheet-body')?.scrollTo({ top: Math.abs(top), behavior: 'smooth' })
  }
}

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

  const { t } = useTranslation()

  const MODE = useMemo(() => {
    return {
    isClose: formMode === 'CLOSE',
    isCreate: formMode === 'CREATE',
    isEdit: formMode === 'EDIT',
  }
  }, [formMode])

  const { request: createUser, loading: creating } = useRequest(UserApi.createUser)
  const { request: updateUser, loading: updating } = useRequest(UserApi.updateUser)

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
      permissions,
      rootEntryPathList,
    } = form

    const res = await (MODE.isCreate ? createUser : updateUser)({
      avatar,
      nickname,
      username,
      password: password ? md5(password) : '',
      password2: '',
      disabled,
      createdAt: 0,
      expiredAt,
      permissions: permissions.sort(permissionSorter),
      rootEntryPathList,
    })

    if (res.success) {
      setFormMode('CLOSE')
      refresh()
      toast.success('OK')
    } else {
      toast.error(res.message)
    }

  }, [refresh, createUser, updateUser, setFormMode, form, MODE])

  return (
    <>
      <SideSheet
        width="100%"
        height="100%"
        placement="top"
        maskClosable={false}
        title={MODE.isCreate
          ? t`title.settings_users_newUser`
          : `${t`title.settings_users_editUser`}${form.username}`
        }
        headerStyle={{ padding: '8px 20px', borderBottom: '1px solid #efefef' }}
        visible={formMode !== 'CLOSE'}
        onCancel={() => setFormMode('CLOSE')}
        getPopupContainer={() => document.querySelector('.gagu-app-settings-user-form')!}
      >
        <div className="gagu-app-settings-user-form-container py-4 mx-auto max-w-lg overflow-y-auto">
          <Form
            labelPosition="left"
            labelAlign="right"
            labelWidth={200}
            initValues={form}
            onSubmit={() => handleSubmit()}
          >
            <Form.Slot label={t`label.avatar`}>
              <div
                className={line(`
                  relative p-1 w-24 h-24
                  border-2 border-dashed border-gray-300 hover:border-blue-500 hover:border-solid
                  text-gray-500 rounded-lg flex justify-center items-center
                `)}
              >
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
                  <SvgIcon.ImageAdd size={48} className="text-gray-200" />
                )}
              </div>
            </Form.Slot>

            <Form.Input
              showClear
              label={t`label.nickname`}
              placeholder="Nickname"
              field="nickname"
              autoComplete="off"
              maxLength={16}
              suffix={<span className="pr-1 text-xs font-din text-gray-500">{form.nickname.length}/16</span>}
              onChange={value => setForm({ ...form, nickname: value.trim() })}
              trigger="blur"
              rules={[
                { required: true, message: 'Required' },
                { min: 2, message: 'At least 2 characters'},
              ]}
            />
            <Form.Input
              showClear
              disabled={MODE.isEdit}
              label={t`label.username`}
              placeholder="Username"
              field="username"
              autoComplete="off"
              maxLength={16}
              suffix={<span className="pr-1 text-xs font-din text-gray-500">{form.username.length}/16</span>}
              extraText="创建后无法修改，只能使用小写英文字母和数字，不能以数字开头，不区分大小写"
              onChange={value => setForm({ ...form, username: value.toLowerCase().trim() })}
              trigger="blur"
              rules={[
                { required: MODE.isCreate, message: 'Required' },
                { min: 1, message: 'At least 1 character'},
              ]}
            />
            <Form.Input
              showClear
              label={t`label.password`}
              placeholder="Password"
              type="password"
              field="password"
              autoComplete="off"
              maxLength={16}
              suffix={<span className="pr-1 text-xs font-din text-gray-500">{form.password.length}/16</span>}
              extraText={MODE.isEdit ? '不修改请留空' : undefined}
              onChange={value => setForm({ ...form, password: value })}
              trigger="blur"
              rules={[
                { required: MODE.isCreate, message: 'Required' },
                { min: 4, message: 'At least 4 characters'},
              ]}
            />
            <Form.Input
              showClear
              label={t`label.passwordConfirmed`}
              placeholder="Password"
              type="password"
              field="password2"
              autoComplete="off"
              maxLength={16}
              suffix={<span className="pr-1 text-xs font-din text-gray-500">{form.password2.length}/16</span>}
              extraText={MODE.isEdit ? '不修改请留空' : undefined}
              onChange={value => setForm({ ...form, password2: value })}
              trigger="blur"
              rules={[
                { required: MODE.isCreate, message: 'Required' },
                { min: 4, message: 'At least 4 characters'},
                {
                  validator(rule, value, callback, source, options) {
                    if (value || form.password) {
                      return value === form.password
                    } else {
                      return true
                    }
                  },
                  message: 'Not matched'
                },
              ]}
            />
            <Form.DatePicker
              type="dateTime"
              label={t`label.validUntil`}
              field="expiredAt"
              className="w-full"
              extraText="永不过期请留空"
              format="yyyy-MM-dd HH:mm"
              timePickerOpts={{ minuteStep: 10 }}
              onChange={date => setForm({ ...form, expiredAt: new Date(date as Date).getTime() })}
            />
            <Form.CheckboxGroup
              label={t`label.permissions`}
              field="permissions"
              onChange={value => setForm({ ...form, permissions: value })}
            >
              {[
                { label: '系统管理 Administer', value: UserPermission.administer, extra: '使用设置（系统、用户管理、日志）、关闭系统等功能，该用户无法被禁用' },
                { label: '读取 Read（必选）', value: UserPermission.read, extra: '读取目录，下载文件，获取缩略图、Exif 信息等', disabled: true, checked: true },
                { label: '写入 Write', value: UserPermission.write, extra: '新建文件夹，上传文件，移动文件、文件夹等' },
                { label: '删除 Delete', value: UserPermission.delete, extra: '删除文件、文件夹（若无删除权限，上传时无法覆盖同名文件）' },
              ].map(({ label, value, extra, disabled }) => (
                <div
                  key={value}
                >
                  <Form.Checkbox value={value} disabled={disabled}>{label}</Form.Checkbox>
                  <p className="mt-1 text-xs text-gray-500">{extra}</p>
                </div>
              ))}
            </Form.CheckboxGroup>
            {/* <Form.TagInput
              label="根目录"
              placeholder="请选择根目录"
              field="rootEntryPathList"
              className="w-full"
              // onChange={value => setForm({ ...form, rootEntryPathList: value as string[] })}
            /> */}
            <div className="pt-2 flex justify-end">
              <Button
                type="tertiary"
                children={t`action.cancel`}
                onClick={() => setFormMode('CLOSE')}
              />
              &emsp;
              <Button
                theme="solid"
                type="primary"
                htmlType="submit"
                className="w-32"
                loading={creating || updating}
                children={MODE.isCreate ? t`action.create` : t`action.save`}
                onClick={handleScrollToError}
              />
            </div>
          </Form>
        </div>
      </SideSheet>
    </>
  )
}
