import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import EntryIcon from '../../apps/FileExplorer/EntryIcon'
import NameLine from '../../apps/FileExplorer/NameLine'
import { line } from '../../utils'
import { rootInfoState } from '../../utils/state'

export default function Desktop() {

  const [rootInfo] = useRecoilState(rootInfoState)
  const [mounted, setMounted] = useState(false)

  // Show Dock and then show Desktop
  useEffect(() => {
    setTimeout(() => setMounted(true), 500)
  }, [])

  return (
    <>
      <div className="gagu-desktop absolute z-0 inset-0 pb-12">
        <div
          className={line(`
            w-full h-full p-4 flex flex-col flex-wrap content-start
            transition-opacity duration-500
            ${mounted ? 'opacity-100' : 'opacity-0'}
          `)}
        >
          {rootInfo.desktopEntryList.map(entry => {
            return (
              <div
                key={entry.name}
                className="w-28 h-20 m-2"
              >
                <EntryIcon
                  entry={entry}
                  scrollHook={{ top: 0, height: window.innerHeight }}
                />
                <NameLine
                  showInput={false}
                  entry={entry}
                  isSelected={false}
                  gridMode={true}
                  currentPath={''}
                  onSuccess={() => { }}
                  onFail={() => { }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
