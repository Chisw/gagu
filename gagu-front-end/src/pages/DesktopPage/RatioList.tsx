import { IWindowRatio } from '../../types'
import { line } from '../../utils'

const ratioListList: IWindowRatio[][] = [
  [
    { xRatio: 0, yRatio: 0, widthRatio: 0.5, heightRatio: 1 },
    { xRatio: 0.5, yRatio: 0, widthRatio: 0.5, heightRatio: 1 },
    { xRatio: 0, yRatio: 0, widthRatio: 1, heightRatio: 0.5 },
    { xRatio: 0, yRatio: 0.5, widthRatio: 1, heightRatio: 0.5 },
  ],
  [
    { xRatio: 0, yRatio: 0, widthRatio: 0.5, heightRatio: 0.5 },
    { xRatio: 0.5, yRatio: 0, widthRatio: 0.5, heightRatio: 0.5 },
    { xRatio: 0, yRatio: 0.5, widthRatio: 0.5, heightRatio: 0.5 },
    { xRatio: 0.5, yRatio: 0.5, widthRatio: 0.5, heightRatio: 0.5 },
  ],
  [
    { xRatio: 0, yRatio: 0, widthRatio: 0.3333, heightRatio: 1 },
    { xRatio: 0.3333, yRatio: 0, widthRatio: 0.3333, heightRatio: 1 },
    { xRatio: 0.6666, yRatio: 0, widthRatio: 0.3333, heightRatio: 1 },
  ],
  [
    { xRatio: 0, yRatio: 0, widthRatio: 0.6666, heightRatio: 1 },
    { xRatio: 0.3333, yRatio: 0, widthRatio: 0.6666, heightRatio: 1 },
  ],
]

interface RatioListProps {
  onClick: (ratio: IWindowRatio) => void
}

export default function RatioList({ onClick }: RatioListProps) {
  return (
    <div className="p-1">
      {ratioListList.map((ratioList, listIndex) => (
        <div
          key={listIndex}
          className="flex"
        >
          {ratioList.map((ratio, ratioIndex) => {
            const { xRatio, yRatio, widthRatio, heightRatio } = ratio
            return (
              <div
                key={ratioIndex}
                className={line(`
                  relative m-1 w-10 aspect-video group
                bg-gray-100 rounded-sm cursor-pointer overflow-hidden hover:bg-blue-100
                  dark:bg-zinc-500  dark:hover:bg-blue-900
                `)}
                onClick={() => onClick(ratio)}
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
