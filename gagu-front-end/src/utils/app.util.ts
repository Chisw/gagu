import { IApp, IRunningApp } from '../types'

export const genRunningApp = (app: IApp) => {
  const _app: IRunningApp = {
    ...app,
    runningId: Date.now(),
    visible: true,
  }
  return _app
}
