import { PhotoSlider } from 'react-photo-view'
import { FsApi } from '../../api'
import { IconButton, SvgIcon } from '../../components/common'
import { IEntry } from '../../types'
import { line } from '../../utils'

interface ViewerProps {
  activeIndex: number
  setActiveIndex: (index: number) => void
  indexLabel: string
  matchedEntryList: IEntry[]
  viewerShow: boolean
  setViewerShow: (is: boolean) => void
}

export default function Viewer(props: ViewerProps) {

  const {
    activeIndex,
    setActiveIndex,
    indexLabel,
    matchedEntryList,
    viewerShow,
    setViewerShow,
  } = props

  return (
    <>
      <PhotoSlider
        images={matchedEntryList.map(entry => ({
          key: entry.name,
          src: FsApi.getEntryStreamUrl(entry),
        }))}
        visible={viewerShow}
        onClose={() => setViewerShow(false)}
        index={activeIndex}
        onIndexChange={setActiveIndex}
        bannerVisible={false}
        overlayRender={({ rotate, onRotate, scale, onScale, index, images, onClose }) => {
          return (
            <div
              className={line(`
                gagu-sync-popstate-overlay
                absolute z-10 top-0 right-0 left-0
                pl-2 pr-1 h-10
                flex justify-between items-center
                bg-black bg-opacity-50
              `)}
            >
              <div className="text-white font-din text-xs md:text-sm break-all truncate">
                [{indexLabel}]
                &nbsp;
                {matchedEntryList[activeIndex].name}
              </div>
              <div className="flex items-center">
                <IconButton
                  className="gagu-photo-viewer-scale-small hidden md:flex"
                  icon={<SvgIcon.SubtractCircle size={18} />}
                  onClick={() => onScale(scale - 0.5)}
                />
                <IconButton
                  className="gagu-photo-viewer-scale-large hidden md:flex"
                  icon={<SvgIcon.AddCircle size={18} />}
                  onClick={() => onScale(scale + 0.5)}
                />
                <IconButton
                  className="gagu-photo-viewer-rotate"
                  icon={<SvgIcon.Restart size={18} />}
                  onClick={() => onRotate(rotate + 90)}
                />
                <IconButton
                  className="gagu-sync-popstate-overlay-close-button"
                  icon={<SvgIcon.Close size={18} />}
                  onClick={onClose}
                />
              </div>
            </div>
          )
        }}
      />
    </>
  )
}
