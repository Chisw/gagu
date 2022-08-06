import { Toaster, IconName, Intent } from '@blueprintjs/core'

const toaster = Toaster.create({ position: 'top' })

const Toast = {

  toast(message: string, timeout?: number, icon?: IconName, intent?: Intent) {
    toaster.show({
      message,
      timeout,
      icon,
      intent,
    })
  },

  primary(message: string, timeout?: number, icon?: IconName) {
    Toast.toast(
      message,
      timeout || 5000,
      icon || 'info-sign',
      'primary',
    )
  },

  success(message: string, timeout?: number, icon?: IconName) {
    Toast.toast(
      message,
      timeout || 2000,
      icon || 'tick-circle',
      'success',
    )
  },

  danger(message: string, timeout?: number, icon?: IconName) {
    Toast.toast(
      message,
      timeout || 3000,
      icon || 'error',
      'danger',
    )
  },

  warning(message: string, timeout?: number, icon?: IconName) {
    Toast.toast(
      message,
      timeout || 5000,
      icon || 'ban-circle',
      'warning',
    )
  },
}

export default Toast