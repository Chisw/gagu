import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { line } from '../../utils'
import { activePageState, baseDataState } from '../../states'
import EntryNode from '../../apps/FileExplorer/EntryNode'
import { Page } from '../../types'

export default function Desktop() {

  const [baseData] = useRecoilState(baseDataState)
  const [activePage] = useRecoilState(activePageState)

  const [show, setShow] = useState(false)

  useEffect(() => {
    if (activePage === Page.desktop) {
      setTimeout(() => setShow(true), 800)
    } else {
      setShow(false)
    }
  }, [activePage])

  return (
    <>
      <div className="gagu-desktop absolute z-0 inset-0 pb-12">
        <div
          className={line(`
            w-full h-full px-3 py-10 flex flex-col flex-wrap content-start
            transition-opacity duration-500
            ${show ? 'opacity-100' : 'opacity-0'}
          `)}
        >
          {baseData.desktopEntryList.map(entry => {
            return (
              <EntryNode
                key={entry.parentPath + entry.name}
                gridMode
                entry={entry}
              />
            )
          })}
        </div>
      </div>
    </>
  )
}
