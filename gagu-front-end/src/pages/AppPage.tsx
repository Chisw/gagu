import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { APP_LIST } from '../apps'
import { useBrowserWindowSize } from '../hooks'
import { useRecoilState } from 'recoil'
import { activePageState } from '../states'
import { Page } from '../types'
import DesktopPage from './DesktopPage'

export default function AppPage() {
  const { appId } = useParams<{ appId: string }>()
  const app = APP_LIST.find(item => item.id === appId)
  const appWindowSize = useBrowserWindowSize()
  const [, setActivePage] = useRecoilState(activePageState)

  useEffect(() => {
    const pageTimer = setTimeout(() => setActivePage(Page.app))
    return () => clearTimeout(pageTimer)
  }, [setActivePage])

  if (!app) return <DesktopPage />

  return (
    <main className="fixed inset-0 overflow-hidden bg-white dark:bg-black">
      <app.AppComponent
        isTopWindow
        appWindowSize={appWindowSize}
        setWindowTitle={() => {}}
        closeWindow={() => {}}
        additionalEntryList={app.additionalEntryList}
      />
    </main>
  )
}
