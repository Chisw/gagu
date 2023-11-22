import { useMemo, useState } from 'react'
import { line, vibrate } from '../../utils'
import { SvgIcon } from '../../components/common'
import { useTranslation } from 'react-i18next'
import { IControlBarDisabledMap } from '../../apps/FileExplorer/ControlBar'

interface FixedMenuProps {
  sideShow: boolean
  setSideShow: (show: boolean) => void
  isSelectionMode: boolean
  disabledMap: IControlBarDisabledMap
  onUploadClick: () => void
}

export default function FixedMenu(props: FixedMenuProps) {
  const {
    sideShow,
    setSideShow,
    isSelectionMode,
    // disabledMap,
    onUploadClick,
  } = props

  const { t } = useTranslation()

  const [expanded, setExpanded] = useState(false)

  const bottomMenuList = useMemo(() => {
    const bottomMenuList = [
      {
        icon: <SvgIcon.SideBar />,
        name: t`action.location`,
        onClick: () => setSideShow(true),
      },
      {
        icon: <SvgIcon.FolderAdd />,
        name: t`action.newFolder`,
        onClick: () => {},
      },
      {
        icon: <SvgIcon.FileAdd />,
        name: t`action.newTextFile`,
        onClick: () => {},
      },
      {
        icon: <SvgIcon.Upload />,
        name: t`action.upload`,
        onClick: onUploadClick,
      },
      {
        icon: <SvgIcon.CloseCircle />,
        name: t`action.cancel`,
        onClick: () => {
          setExpanded(false)
        },
      },
    ]
    return bottomMenuList
  }, [onUploadClick, t, setSideShow])

  return (
    <>
      <div
        className={line(`
          fixed z-20 
          border shadow-lg bg-white overflow-hidden
          transition-all duration-200 select-none
          ${(sideShow || isSelectionMode) ? 'scale-0 origin-center' : 'sclae-100 origin-bottom-right'}
          ${expanded
            ? 'right-[10px] bottom-[10px] w-44 h-64 rounded-xl'
            : 'right-[1rem] bottom-[1rem] w-12 h-12 rounded-3xl'
          }
        `)}
      >
        {expanded ? (
          <div className="py-1 w-44 break-keep">
            <div className="flex justify-around items-center h-8 break-keep">
              {/* <ToolButton
                title={`${t`action.backward`} [Shift + ←]`}
                icon={<SvgIcon.ArrowLeft />}
                disabled={disabledMap.navBack}
                onClick={onNavBack}
              />
              <ToolButton
                title={`${t`action.forward`} [Shift + →]`}
                icon={<SvgIcon.ArrowRight />}
                disabled={disabledMap.navForward}
                onClick={onNavForward}
              />
              {disabledMap.refresh ? (
                <ToolButton
                  title={t`action.cancel`}
                  icon={<SvgIcon.Close />}
                  onClick={() => abortController?.abort()}
                />
              ) : (
                <ToolButton
                  title={`${t`action.refresh`} [Shift + R]`}
                  icon={<SvgIcon.Refresh />}
                  onClick={onNavRefresh}
                />
              )}
              <ToolButton
                title={`${t`action.navToParent`} [Shift + ↑]`}
                icon={<SvgIcon.ArrowUp />}
                disabled={disabledMap.navToParent}
                onClick={onNavToParent}
              /> */}
            </div>
            <div className="mt-2 break-keep">
              {bottomMenuList.map(({ icon, name, onClick }, index) => (
                <div
                  key={index}
                  className="flex items-center px-3 py-2 transition-all duration-200 active:scale-95 active:bg-gray-100 rounded-lg break-keep"
                  onClick={() => {
                    vibrate()
                    onClick()
                    setExpanded(false)
                  }}
                >
                  <div className="mr-2">{icon}</div>
                  <div className="text-base">{name}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="w-full h-full flex justify-center items-center text-gray-800"
            onClick={() => {
              vibrate()
              setExpanded(true)
            }}
          >
            <SvgIcon.G />
          </div>
        )}
      </div>
    </>
  )
}
