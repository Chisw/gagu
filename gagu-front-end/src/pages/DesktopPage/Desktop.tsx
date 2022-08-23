import { useRecoilState } from 'recoil'
import EntryIcon from '../../apps/FileExplorer/EntryIcon'
import NameLine from '../../apps/FileExplorer/NameLine'
import { rootInfoState } from '../../utils/state'

export default function Desktop() {

  const [rootInfo] = useRecoilState(rootInfoState)

  return (
    <>
      <div className="gagu-desktop absolute z-0 inset-0 pb-10">
        <div className="w-full h-full p-4 flex flex-col flex-wrap content-start">
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
                  currentDirPath={''}
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