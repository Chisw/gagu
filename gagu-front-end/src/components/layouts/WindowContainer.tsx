import { runningAppListState } from '../../utils/state'
import { useRecoilState } from 'recoil'
import Window from './Window'


export default function WindowContainer() {

  const [runningAppList] = useRecoilState(runningAppListState)

  return (
    <>
      <div
        id="app-container"
        className="absolute z-10"
        style={{
          top: '1.5rem',
          left: '-100%',
          width: '300%',
          height: '200%',
        }}
      >
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