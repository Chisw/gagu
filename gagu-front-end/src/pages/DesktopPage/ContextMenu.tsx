import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import { SvgIcon } from '../../components/base'
import { useClickAway } from '../../hooks'
import { line } from '../../utils'
import { contextMenuState } from '../../utils/state'

export default function ContextMenu() {

  const [menuShow, setMenuShow] = useState(false)

  const handleClose = useCallback(() => {
    setMenuShow(false)
  }, [])

  const menuRef = useRef(null)

  useClickAway(menuRef, handleClose)

  const [contextMenu] = useRecoilState(contextMenuState)

  const { top, left, menuItemList } = useMemo(() => {
    return contextMenu || { top: 0, left: 0, menuItemList: [] }
  }, [contextMenu])

  useEffect(() => {
    setMenuShow(true)
  }, [contextMenu])

  return (
    <>
      <div
        ref={menuRef}
        className={line(`
          absolute z-30 py-1 w-44 bg-white-900 backdrop-filter backdrop-blur shadow-lg border
          ${menuShow ? 'block' : 'hidden'}
        `)}
        style={{ top, left }}
      >
        {menuItemList?.map(({ icon, label, children, onClick }) => {
          return (
            <div
              key={label}
              className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm group"
              onClick={() => {
                onClick()
                !children && handleClose()
              }}
            >
              <div className="relative flex items-center">
                {icon}
                <span className="ml-2 flex-grow">{label}</span>
                {children && <SvgIcon.ChevronRight />}
                {children && (
                  <div className="absolute top-0 left-0 w-44 -mt-1 ml-40 hidden group-hover:block py-1 bg-white-800 backdrop-filter backdrop-blur shadow-lg border">
                    {children.map(({ icon, label, onClick }) => (
                      <div
                        key={label}
                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm flex items-center"
                        onClick={() => {
                          onClick()
                          handleClose()
                        }}
                      >
                        {icon}
                        <span className="ml-2 flex-grow">{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
