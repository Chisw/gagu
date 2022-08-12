interface ToastParams {
  message: string
  timeout: number
  icon: any
  intent: string
}

const toaster = {
  show: (params: ToastParams) => {
    const {
      message,
      // timeout,
      // icon,
      // intent,
    } = params
    alert(message)
  },
}

const Toast = {

  toast(message: string, timeout?: number, icon?: string, intent?: string) {
    toaster.show({
      message,
      timeout: timeout || 3000,
      icon,
      intent: intent || '',
    })
  },

  primary(message: string, timeout?: number, icon?: string) {
    Toast.toast(
      message,
      timeout || 5000,
      icon || 'info-sign',
      'primary',
    )
  },

  success(message: string, timeout?: number, icon?: string) {
    Toast.toast(
      message,
      timeout || 2000,
      icon || 'tick-circle',
      'success',
    )
  },

  danger(message: string, timeout?: number, icon?: string) {
    Toast.toast(
      message,
      timeout || 3000,
      icon || 'error',
      'danger',
    )
  },

  warning(message: string, timeout?: number, icon?: string) {
    Toast.toast(
      message,
      timeout || 5000,
      icon || 'ban-circle',
      'warning',
    )
  },
}

export default Toast