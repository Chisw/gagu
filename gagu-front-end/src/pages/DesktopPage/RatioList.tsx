import { useEffect } from 'react'
import { IWindowInfo, IWindowRatio } from '../../types'
import { line } from '../../utils'
import { getAppWindowSize } from './Window'
import { useRecoilState } from 'recoil'
import { demoWindowInfoState } from '../../states'

const ratioListList: IWindowRatio[][] = [
  [
    { xRatio: 0, yRatio: 0, widthRatio: 0.5, heightRatio: 0.5 },
    { xRatio: 0, yRatio: 0, widthRatio: 1, heightRatio: 0.5 },
    { xRatio: 0.5, yRatio: 0, widthRatio: 0.5, heightRatio: 0.5 },
  ],
  [
    { xRatio: 0, yRatio: 0, widthRatio: 0.5, heightRatio: 1 },
    { xRatio: 0.1, yRatio: 0.1, widthRatio: 0.8, heightRatio: 0.8 },
    { xRatio: 0.5, yRatio: 0, widthRatio: 0.5, heightRatio: 1 },
  ],
  [
    { xRatio: 0, yRatio: 0.5, widthRatio: 0.5, heightRatio: 0.5 },
    { xRatio: 0, yRatio: 0.5, widthRatio: 1, heightRatio: 0.5 },
    { xRatio: 0.5, yRatio: 0.5, widthRatio: 0.5, heightRatio: 0.5 },
  ],
  [
    { xRatio: 0, yRatio: 0, widthRatio: 0.3333, heightRatio: 1 },
    { xRatio: 0.3333, yRatio: 0, widthRatio: 0.3333, heightRatio: 1 },
    { xRatio: 0.6666, yRatio: 0, widthRatio: 0.3333, heightRatio: 1 },
  ],
  [
    { xRatio: 0, yRatio: 0, widthRatio: 0.6666, heightRatio: 1 },
    { xRatio: 0, yRatio: 0, widthRatio: 1, heightRatio: 1 },
    { xRatio: 0.3333, yRatio: 0, widthRatio: 0.6666, heightRatio: 1 },
  ],
]

const getComputedWindowInfo = (ratio: IWindowRatio) => {
  const { xRatio, yRatio, widthRatio, heightRatio } = ratio
  const { maxWidth, maxHeight, menuBarHeight } = getAppWindowSize()
  const x = Math.ceil(maxWidth * xRatio)
  const y = Math.ceil(maxHeight * yRatio) + menuBarHeight
  const width = Math.ceil(maxWidth * widthRatio)
  const height = Math.ceil(maxHeight * heightRatio)
  const info: IWindowInfo = { x, y, width, height }
  return info
}

interface RatioListProps {
  onClick: (info: IWindowInfo) => void
}

export default function RatioList({ onClick }: RatioListProps) {

  const [, setDemoWindowInfo] = useRecoilState(demoWindowInfoState)

  useEffect(() => {
    return () => setDemoWindowInfo(null)
  }, [setDemoWindowInfo])

  return (
    <div className="p-1">
      {ratioListList.map((ratioList, listIndex) => (
        <div
          key={listIndex}
          className={`flex ${listIndex > 2 ? 'mt-1 pt-1 border-t border-gray-100 dark:border-zinc-600' : ''}`}
        >
          {ratioList.map((ratio, ratioIndex) => {
            const { xRatio, yRatio, widthRatio, heightRatio } = ratio

            return (
              <div
                key={`${listIndex}-${ratioIndex}`}
                className={line(`
                  relative m-1 w-10 aspect-video group
                bg-gray-100 rounded-sm cursor-pointer overflow-hidden hover:bg-blue-100
                  dark:bg-zinc-500  dark:hover:bg-blue-900
                `)}
                onMouseEnter={() => setDemoWindowInfo(getComputedWindowInfo(ratio))}
                onMouseLeave={() => setDemoWindowInfo(null)}
                onClick={() => {
                  onClick(getComputedWindowInfo(ratio))
                  setDemoWindowInfo(null)
                }}
              >
                <div
                  className="absolute bg-gray-300 rounded-sm group-hover:bg-blue-500 dark:bg-zinc-400 dark:group-hover:bg-blue-600"
                  style={{
                    top: `${yRatio * 100}%`,
                    left: `${xRatio * 100}%`,
                    width: `${widthRatio * 100}%`,
                    height: `${heightRatio * 100}%`,
                  }}
                />
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
