import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { SvgIcon } from './common'
import { contextMenuDataState } from '../states'
import { Dropdown } from '@douyinfe/semi-ui'
import { line } from '../utils'

export function ContextMenu() {

  const { pathname } = useLocation()

  const [contextMenuData] = useRecoilState(contextMenuDataState)

  const [menuShow, setMenuShow] = useState(false)

  const menuRef = useRef(null)

  const { top, left, menuItemList, isDock } = useMemo(() => {
    const { eventData, menuItemList, isDock } = contextMenuData || {
      eventData: null,
      menuItemList: [],
      isDock: false,
    }

    const { target, clientX, clientY } = eventData || {
      target: null,
      clientX: 0,
      clientY: 0,
    }

    const filteredMenuItemList = menuItemList.filter(o => o.isShow)

    let top = 0
    let left = 0

    if (isDock) {
      const { top: targetTop, left: targetLeft } = (target as any).getBoundingClientRect()
      const verticalOffset = filteredMenuItemList.length * 36 + 50
      top = targetTop - verticalOffset
      left = targetLeft
    } else {
      top = clientY - 24
      left = clientX
    }

    return {
      top,
      left,
      menuItemList: filteredMenuItemList,
      isDock,
    }
  }, [contextMenuData])

  const closeAfterClick = useCallback((clickFn: () => void) => {
    return () => {
      clickFn()
      setMenuShow(false)
    }
  }, [])

  useEffect(() => {
    setMenuShow(!!contextMenuData?.menuItemList.length)
  }, [contextMenuData])

  useEffect(() => {
    setTimeout(() => setMenuShow(false))
  }, [pathname])

  return (
    <>
      <div
        ref={menuRef}
        className="gagu-contextmenu absolute z-30 h-0"
        style={{ top, left }}
      >
        <Dropdown
          trigger="custom"
          position="bottomLeft"
          className={line(`
            gagu-contextmenu-dropdown
            select-none bg-white
            ${isDock
              ? 'dark:bg-black dark:text-zinc-300'
              : 'bg-opacity-80 backdrop-blur dark:bg-zinc-700 dark:bg-opacity-80'}
          `)}
          visible={menuShow}
          onClickOutSide={(e: any) => {
            if (e.target.closest('.gagu-context-menu-sub-menu')) return
            setMenuShow(false)
          }}
          render={
            <Dropdown.Menu className={isDock ? 'w-56' : 'w-44'}>
              {menuItemList?.map(({ icon, name, children, onClick }) => {
                if (children) {
                  return (
                    <Dropdown
                      key={name}
                      position="rightTop"
                      className={line(`
                        gagu-context-menu-sub-menu
                        bg-white bg-opacity-80 backdrop-blur min-w-[160px]
                        dark:bg-zinc-700 dark:bg-opacity-80
                      `)}
                      menu={
                        children.map(m => ({
                          ...m,
                          node: 'item',
                          onClick: closeAfterClick(m.onClick),
                        }))
                      }
                    >
                      <Dropdown.Item icon={icon} >
                        <div className="w-full flex justify-between items-center">
                          <span>{name}</span>
                          <SvgIcon.ChevronRight className="text-gray-400"/>
                        </div>
                      </Dropdown.Item>
                    </Dropdown>
                  )
                }

                return (
                  <Dropdown.Item
                    key={name}
                    icon={icon}
                    onClick={closeAfterClick(onClick)}
                  >
                    {name}
                  </Dropdown.Item>
                )
              })}
              {isDock && (
                <div className="absolute z-[-1] left-0 bottom-0 -mb-1 ml-3 w-3 h-3 bg-white rotate-45 rounded-sm dark:bg-black" />
              )}
            </Dropdown.Menu>
          }
        />
      </div>
    </>
  )
}
