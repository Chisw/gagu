import { Button, Form, Modal } from '@douyinfe/semi-ui'
import { useTranslation } from 'react-i18next'
import { useRequest, useTouchMode } from '../hooks'
import { useCallback, useEffect, useState } from 'react'
import { UserApi } from '../api'
import { Page, UserPasswordForm } from '../types'
import md5 from 'md5'
import { UserInfoStore } from '../utils'
import toast from 'react-hot-toast'
import { useRecoilState } from 'recoil'
import { activePageState } from '../states'
import { useNavigate } from 'react-router'

interface ChangePasswordModalProps {
  show: boolean
  onClose: () => void
}

export function ChangePasswordModal(props: ChangePasswordModalProps) {

  const { show, onClose } = props

  const navigate = useNavigate()
  const { t } = useTranslation()
  const touchMode = useTouchMode()

  const [, setActivePage] = useRecoilState(activePageState)

  const [form, setForm] = useState(new UserPasswordForm())

  const { request: updateUserPassword, loading } = useRequest(UserApi.updateUserPassword)

  const handleSubmit = useCallback(async () => {
    const { password, newPassword } = form

    const { success } = await updateUserPassword({
      password: md5(password),
      newPassword: md5(newPassword),
      newPassword2: '',
    })

    if (success) {
      UserInfoStore.remove()
      toast.success('OK')
      onClose()
      setActivePage(Page.PENDING)
      setTimeout(() => {
        navigate('/login')
      }, 500)
    }
  }, [form, updateUserPassword, onClose, setActivePage, navigate])

  useEffect(() => {
    if (!show) {
      setForm(new UserPasswordForm())
    }
  }, [show])

  return (
    <>
      <Modal
        centered
        maskClosable={false}
        className="gagu-sync-popstate-overlay gagu-prevent-hotkeys-overlay"
        title={t`title.changePassword`}
        fullScreen={touchMode}
        width={400}
        visible={show}
        footer={null}
        onCancel={onClose}
      >
          <Form
            labelPosition={touchMode ? 'top' : 'left'}
            labelAlign={touchMode ? 'left': 'right'}
            labelWidth={120}
            initValues={form}
            onSubmit={handleSubmit}
          >
            <Form.Input
              autoFocus
              showClear
              label={t`label.passwordOld`}
              placeholder={t`hint.input`}
              type="password"
              field="password"
              autoComplete="off"
              maxLength={16}
              suffix={<span className="pr-1 text-xs font-din text-gray-500">{form.password.length}/16</span>}
              onChange={value => setForm({ ...form, password: value })}
              trigger="blur"
              rules={[
                { required: true, message: t`hint.required` },
                { min: 4, message: t('hint.atLeastCharacters', { count: 4 }) },
              ]}
            />
            <Form.Input
              showClear
              label={t`label.password`}
              placeholder={t`hint.input`}
              type="password"
              field="newPassword"
              autoComplete="off"
              maxLength={16}
              suffix={<span className="pr-1 text-xs font-din text-gray-500">{form.newPassword.length}/16</span>}
              onChange={value => setForm({ ...form, newPassword: value })}
              trigger="blur"
              rules={[
                { required: true, message: t`hint.required` },
                { min: 4, message: t('hint.atLeastCharacters', { count: 4 }) },
              ]}
            />
            <Form.Input
              showClear
              label={t`label.passwordConfirmed`}
              placeholder={t`hint.input`}
              type="password"
              field="newPassword2"
              autoComplete="off"
              maxLength={16}
              suffix={<span className="pr-1 text-xs font-din text-gray-500">{form.newPassword2.length}/16</span>}
              onChange={value => setForm({ ...form, newPassword2: value })}
              trigger="blur"
              rules={[
                { required: true, message: t`hint.required` },
                { min: 4, message: t('hint.atLeastCharacters', { count: 4 }) },
                {
                  validator(rule, value, callback, source, options) {
                    if (value || form.newPassword) {
                      return value === form.newPassword
                    } else {
                      return true
                    }
                  },
                  message: t`hint.notMatched`,
                },
              ]}
            />
            <div className="pt-2 pb-4 flex justify-end select-none">
              <Button
                type="tertiary"
                children={t`action.cancel`}
                className="gagu-sync-popstate-overlay-close-button"
                onClick={onClose}
              />
              &emsp;
              <Button
                theme="solid"
                type="primary"
                htmlType="submit"
                className="w-32"
                loading={loading}
                children={t`action.confirm`}
              />
            </div>
          </Form>
      </Modal>
    </>
  )
}
