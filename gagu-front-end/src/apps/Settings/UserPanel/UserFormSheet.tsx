import md5 from 'md5'
import { useCallback, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FormModeType } from '.'
import { FsApi, UserApi } from '../../../api'
import { SvgIcon, IconButton } from '../../../components/common'
import { useRequest, useTouchMode } from '../../../hooks'
import { AppId, EntryType, IUserForm, UserPermission } from '../../../types'
import { getImageTypeBase64ByURL, getTimestampParam, line, permissionSorter } from '../../../utils'
import { Button, Form, SideSheet } from '@douyinfe/semi-ui'
import { useTranslation } from 'react-i18next'
import { userInfoState } from '../../../states'
import { useRecoilState } from 'recoil'
import { semiLocaleMap } from '../../../i18n'
import { EntryPicker, EntryPickerMode } from '../../../components'

const handleScrollToError = () => {
  const top = document.querySelector('.gagu-app-settings-user-form .semi-form-field-error-message')?.closest('.semi-form-field')?.getBoundingClientRect()?.top
  if (top) {
    document.querySelector('.gagu-app-settings-user-form .semi-sidesheet-body')?.scrollTo({ top: Math.abs(top), behavior: 'smooth' })
  }
}

interface UserFormModalProps {
  formMode: FormModeType
  form: IUserForm
  setForm: (form: IUserForm) => void
  setFormMode: (mode: FormModeType) => void
  onRefresh: () => void
}

export default function UserFormModal(props: UserFormModalProps) {

  const {
    formMode,
    form,
    setForm,
    setFormMode,
    onRefresh,
  } = props

  const { t, i18n: { language } } = useTranslation()
  const touchMode = useTouchMode()

  const [userInfo] = useRecoilState(userInfoState)

  const [assignedPathEntryPickerShow, setAssignedPathEnteryPickerShow] = useState(false)

  const { request: createUser, loading: creating } = useRequest(UserApi.createUser)
  const { request: updateUser, loading: updating } = useRequest(UserApi.updateUser)

  const fileInputRef = useRef<any>(null)

  const MODE = useMemo(() => {
    return {
    isClose: formMode === 'CLOSE',
    isCreate: formMode === 'CREATE',
    isEdit: formMode === 'EDIT',
  }
  }, [formMode])

  const isCurrentUser = useMemo(() => {
    return form.username === userInfo?.username
  }, [form.username, userInfo?.username])

  const { isAdminister, isAssigned } = useMemo(() => {
    const isAdminister = form.permissions.includes(UserPermission.administer)
    const isAssigned = form.assignedRootPathList.length > 0
    return { isAdminister, isAssigned }
  }, [form])

  const handleFileChange = useCallback(() => {
    const file = fileInputRef?.current?.files[0]
    if (file) {
      if (!/image\/\w+/.test(file.type)) {
        toast.error(t`tip.notImage`)
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
  }, [form, setForm, t])

  const handleSubmit = useCallback(async () => {
    const {
      password,
      permissions,
    } = form

    const { success } = await (MODE.isCreate ? createUser : updateUser)({
      ...form,
      password: password ? md5(password) : '',
      password2: '',
      permissions: permissions.sort(permissionSorter),
    })

    if (success) {
      toast.success('OK')
      setFormMode('CLOSE')
      onRefresh()
      if (isCurrentUser) {
        document.querySelectorAll('.gagu-user-avatar').forEach((el: any) => {
          el.style.backgroundImage = `url("${FsApi.getPublicAvatarStreamUrl(form.username)}?${getTimestampParam()}")`
        })
      }
    }
  }, [form, MODE.isCreate, createUser, updateUser, setFormMode, onRefresh, isCurrentUser])

  return (
    <>
      <SideSheet
        width="100%"
        height="100%"
        placement="right"
        maskClosable={false}
        title={MODE.isCreate
          ? t`title.settings_users_newUser`
          : `${t`title.settings_users_editUser`}${form.username}`
        }
        headerStyle={{ padding: '8px 20px' }}
        visible={formMode !== 'CLOSE'}
        onCancel={() => setFormMode('CLOSE')}
        getPopupContainer={() => document.querySelector('.gagu-app-settings-user-form')!}
      >
        <div className="py-4 max-w-lg overflow-y-auto">
          <Form
            labelPosition={touchMode ? 'top' : 'left'}
            labelAlign={touchMode ? 'left': 'right'}
            labelWidth={200}
            initValues={form}
            onSubmit={handleSubmit}
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
              placeholder={t`hint.input`}
              field="nickname"
              autoComplete="off"
              maxLength={16}
              suffix={<span className="pr-1 text-xs font-din text-gray-500">{form.nickname.length}/16</span>}
              onChange={value => setForm({ ...form, nickname: value.trim() })}
              trigger="blur"
              rules={[
                { required: true, message: t`hint.required` },
                { min: 2, message: t('hint.atLeastCharacters', { count: 2 }) },
              ]}
            />
            <Form.Input
              showClear
              disabled={MODE.isEdit}
              label={t`label.username`}
              placeholder={t`hint.input`}
              field="username"
              autoComplete="off"
              maxLength={16}
              suffix={<span className="pr-1 text-xs font-din text-gray-500">{form.username.length}/16</span>}
              extraText={t`hint.username_extra`}
              onChange={value => setForm({ ...form, username: value.toLowerCase().trim() })}
              trigger="blur"
              rules={[
                { required: MODE.isCreate, message: t`hint.required` },
                { min: 1, message: t('hint.atLeastCharacters', { count: 1 }) },
              ]}
            />
            <Form.Input
              showClear
              label={t`label.password`}
              placeholder={t`hint.input`}
              type="password"
              field="password"
              autoComplete="off"
              maxLength={16}
              suffix={<span className="pr-1 text-xs font-din text-gray-500">{form.password.length}/16</span>}
              extraText={MODE.isEdit ? t`hint.noInputNoModification` : undefined}
              onChange={value => setForm({ ...form, password: value })}
              trigger="blur"
              rules={[
                { required: MODE.isCreate, message: t`hint.required` },
                { min: 4, message: t('hint.atLeastCharacters', { count: 4 }) },
              ]}
            />
            <Form.Input
              showClear
              label={t`label.passwordConfirmed`}
              placeholder={t`hint.input`}
              type="password"
              field="password2"
              autoComplete="off"
              maxLength={16}
              suffix={<span className="pr-1 text-xs font-din text-gray-500">{form.password2.length}/16</span>}
              extraText={MODE.isEdit ? t`hint.noInputNoModification` : undefined}
              onChange={value => setForm({ ...form, password2: value })}
              trigger="blur"
              rules={[
                { required: MODE.isCreate, message: t`hint.required` },
                { min: 4, message: t('hint.atLeastCharacters', { count: 4 }) },
                {
                  validator(rule, value, callback, source, options) {
                    if (value || form.password) {
                      return value === form.password
                    } else {
                      return true
                    }
                  },
                  message: t`hint.notMatched`,
                },
              ]}
            />
            <Form.Checkbox
              label={t`label.passwordLock`}
              field="passwordLocked"
              className="mt-1.5"
              onChange={(e) => setForm({ ...form, passwordLocked: e.target.checked || false })}
            >
              {t`label.passwordLock_locked`}
            </Form.Checkbox>
            <Form.DatePicker
              type="dateTime"
              label={t`label.validUntil`}
              placeholder={t`hint.choose`}
              field="expiredAt"
              className="w-full"
              extraText={t`hint.noLimitLeaveBlank`}
              format="yyyy-MM-dd HH:mm"
              timePickerOpts={{ minuteStep: 10, stopPropagation: true }}
              locale={semiLocaleMap[language].DatePicker}
              onChange={date => setForm({ ...form, expiredAt: new Date(date as Date).getTime() })}
            />
            <Form.CheckboxGroup
              label={t`label.permissions`}
              field="permissions"
              onChange={permissions => {
                if (permissions.includes(UserPermission.administer)) {
                  setForm({ ...form, permissions, assignedRootPathList: [] })
                } else {
                  setForm({ ...form, permissions })
                }
              }}
            >
              {[
                { label: t`label.permission_administer`, value: UserPermission.administer, extra: t`hint.permission_administer_extra` },
                { label: t`label.permission_read`, value: UserPermission.read, extra: t`hint.permission_read_extra`, disabled: true },
                { label: t`label.permission_write`, value: UserPermission.write, extra: t`hint.permission_write_extra` },
                { label: t`label.permission_delete`, value: UserPermission.delete, extra: t`hint.permission_delete_extra` },
              ].map(({ label, value, extra, disabled }) => (
                <div key={value}>
                  <Form.Checkbox
                    value={value}
                    disabled={disabled}
                  >
                    {label}
                  </Form.Checkbox>
                  <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">{extra}</p>
                </div>
              ))}
            </Form.CheckboxGroup>
            <Form.Slot
              label={t`label.accessiblePaths`}
              style={{ display: isAdminister ? 'none' : undefined }}
            >
              <div className={`py-1 ${form.assignedRootPathList?.length ? 'block' : 'hidden'}`}>
                {form.assignedRootPathList?.map((path) => (
                  <div
                    key={path}
                    className={line(`
                      mb-1 pl-2 pr-1 py-1 text-xs rounded border
                      flex items-center
                      bg-gray-100 text-gray-800 border-gray-200
                      dark:bg-zinc-600 dark:text-zinc-300 dark:border-zinc-500
                    `)}
                  >
                    <SvgIcon.Folder className="mr-1 flex-shrink-0" />
                    <div className="mr-2 flex-grow break-all">{path}</div>
                    <IconButton
                      size="xs"
                      icon={<SvgIcon.Close className="text-gray-400 hover:text-gray-900" />}
                      onClick={() => {
                        const { assignedRootPathList: list } = form
                        const assignedRootPathList = list.filter((p) => p !== path)
                        setForm({ ...form, assignedRootPathList })
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="py-1">
                <Button
                  size="small"
                  icon={<SvgIcon.Add />}
                  onClick={() => setAssignedPathEnteryPickerShow(true)}
                >
                  {t`action.add`}
                </Button>
              </div>
              {(!isAdminister && !isAssigned) && (
                <p className="mt-1 text-xs text-gray-500 flex items-center dark:text-zinc-400">
                  <SvgIcon.Warning />
                  <span className="ml-1">{t`hint.accessiblePaths_extra`}</span>
                </p>
              )}
            </Form.Slot>
            <div className="pt-2 pb-4 flex justify-end select-none">
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

      <EntryPicker
        show={assignedPathEntryPickerShow}
        appId={AppId.settings}
        mode={EntryPickerMode.open}
        type={EntryType.directory}
        title={t`action.open`}
        onConfirm={({ pickedPath }) => {
          const assignedRootPathList = Array.from(new Set([...form.assignedRootPathList, pickedPath]))
          setForm({ ...form, assignedRootPathList })
          setAssignedPathEnteryPickerShow(false)
        }}
        onCancel={() => setAssignedPathEnteryPickerShow(false)}
      />
    </>
  )
}
