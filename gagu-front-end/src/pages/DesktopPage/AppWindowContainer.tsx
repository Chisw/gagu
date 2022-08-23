import { runningAppListState } from '../../utils/state'
import { useRecoilState } from 'recoil'
import AppWindow from '../../components/AppWindow'

export default function AppWindowContainer() {

  const [runningAppList] = useRecoilState(runningAppListState)

  return (
    <>
      <div className="absolute z-10">
        {runningAppList.map(app => (
          <AppWindow
            key={app.runningId}
            app={app}
          />
        ))}
      </div>
    </>
  )
}
