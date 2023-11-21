import { runningAppListState } from '../../states'
import { useRecoilState } from 'recoil'
import Window from './Window'

export default function WindowContainer() {

  const [runningAppList] = useRecoilState(runningAppListState)

  return (
    <>
      <div className="gagu-app-window-container absolute z-10">
        {runningAppList.map(app => (
          <Window
            key={app.runningId}
            app={app}
          />
        ))}
      </div>
    </>
  )
}
