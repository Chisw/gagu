import { createContext, useContext } from 'react'
import { Navigate, Outlet, useMatch } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { APP_LIST } from '../apps'
import { SystemDaemon } from './SystemDaemon'
import { useSystemBootstrap } from './useSystemBootstrap'

const SystemContext = createContext({ loading: false, refresh: async () => false })

export const useSystemRuntime = () => useContext(SystemContext)

export function SystemRuntime() {
  const appRoute = useMatch('/app/:appId')

  const app = APP_LIST.find(item => item.id === appRoute?.params.appId)
  const requireSession = !appRoute || !app || !!app.requiresSession

  const bootstrap = useSystemBootstrap(requireSession)
  const { t } = useTranslation()

  if (bootstrap.needsLogin) return <Navigate to="/login" replace />

  if (requireSession && !bootstrap.ready) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-900 dark:text-white">
        <p>{bootstrap.status === 'error' ? t('server.ERROR_NO_RESPONSE') : t('tip.loading')}</p>
        {bootstrap.status === 'error' && (
          <button onClick={() => void bootstrap.refresh()}>
            {t('action.refresh')}
          </button>
        )}
      </div>
    )
  }

  return (
    <SystemContext.Provider
      value={{
        loading: bootstrap.loading,
        refresh: bootstrap.refresh,
      }}
    >
      <SystemDaemon>
        <Outlet />
      </SystemDaemon>
    </SystemContext.Provider>
  )
}
