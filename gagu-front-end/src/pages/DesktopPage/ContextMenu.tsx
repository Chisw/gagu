import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { SvgIcon } from '../../components/base'
import { useClickAway } from '../../hooks'
import { line } from '../../utils'
import { contextMenuDataState } from '../../states'

export default function ContextMenu() {

  const { pathname } = useLocation()

  const [menuShow, setMenuShow] = useState(false)

  useEffect(() => {
    setTimeout(() => setMenuShow(false))
  }, [pathname])

  const handleClose = useCallback(() => {
    setMenuShow(false)
  }, [])

  const menuRef = useRef(null)

  useClickAway(menuRef, handleClose)

  const [contextMenuData] = useRecoilState(contextMenuDataState)

  const { top, left, menuItemList, isDock } = useMemo(() => {
    const { eventData, menuItemList, isDock } = contextMenuData || { eventData: null, menuItemList: [], isDock: false }
    const { target, clientX, clientY } = eventData || { target: null, clientX: 0, clientY: 0 }
    const filteredMenuItemList = menuItemList.filter(o => o.isShow)

    let top = 0
    let left = 0

    if (isDock) {
      const { top: targetTop, left: targetLeft } = (target as any).getBoundingClientRect()
      const offset = filteredMenuItemList.length * 36 + 30
      top = targetTop - offset
      left = targetLeft
    } else {
      top = clientY
      left = clientX
    }

    return {
      top,
      left,
      menuItemList: filteredMenuItemList,
      isDock,
    }
  }, [contextMenuData])

  useEffect(() => {
    setMenuShow(!!contextMenuData?.menuItemList.length)
  }, [contextMenuData])

  return (
    <>
      <div
        ref={menuRef}
        className={line(`
          gagu-contextmenu
          absolute z-30 py-1 bg-white shadow-lg border rounded-lg
          ${isDock ? 'w-56' : 'w-44'}
          ${menuShow ? 'block' : 'hidden'}
        `)}
        style={{ top, left }}
      >
        {menuItemList?.map(({ icon, label, children, onClick }) => {
          return (
            <div
              key={label}
              className="relative z-10 px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm group"
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
                  <div className="absolute top-0 left-0 w-44 -mt-1 ml-40 hidden group-hover:block py-1 bg-white shadow-lg border rounded-lg">
                    {children.map(({ icon, label, onClick }) => (
                      <div
                        key={label}
                        className="px-3 py-2 text-black hover:bg-gray-100 cursor-pointer text-sm flex items-center"
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
        {isDock && (
          <div className="absolute z-0 left-0 bottom-0 -mb-1 ml-2 w-3 h-3 bg-white rotate-45 rounded-sm" />
        )}
      </div>
    </>
  )
}
