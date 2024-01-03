import { demoWindowInfoState, runningAppListState } from '../../states'
import { useRecoilState } from 'recoil'
import Window from './Window'
import { line } from '../../utils'
import { useEffect, useState } from 'react'
import { IWindowInfo } from '../../types'

export default function WindowContainer() {

  const [runningAppList] = useRecoilState(runningAppListState)
  const [demoWindowInfo] = useRecoilState(demoWindowInfoState)

  const [infoCache, setInfoCache] = useState<IWindowInfo>({ x: 0, y: 0, width: 0, height: 0 })

  useEffect(() => {
    if (demoWindowInfo) {
      setInfoCache(demoWindowInfo)
    }
  }, [demoWindowInfo])

  return (
    <>
      <div className="gagu-app-window-container absolute z-10">
        <div
          className={line(`
            absolute z-[9999]
            border-2 border-zinc-500 border-opacity-40 rounded
            bg-zinc-500 bg-opacity-30
            transition-all duration-200 pointer-events-none
            dark:border-zinc-400
            ${demoWindowInfo ? 'opacity-100' : 'opacity-0'}
          `)}
          style={{
            top: (demoWindowInfo || infoCache).y,
            left: (demoWindowInfo || infoCache).x,
            width: (demoWindowInfo || infoCache).width,
            height: (demoWindowInfo || infoCache).height,
          }}
        />

        {runningAppList.map(app => (
          <Window
            key={app.runningId}
            app={app}
            additionalEntryList={app.additionalEntryList}
          />
        ))}
      </div>
    </>
  )
}
