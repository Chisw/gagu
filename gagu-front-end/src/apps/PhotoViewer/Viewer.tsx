import { PhotoSlider } from 'react-photo-view'
import { FsApi } from '../../api'
import { IconButton, SvgIcon } from '../../components/common'
import { IEntry } from '../../types'

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
        images={matchedEntryList.map(entry => ({ src: FsApi.getEntryStreamUrl(entry), key: entry.name }))}
        visible={viewerShow}
        onClose={() => setViewerShow(false)}
        index={activeIndex}
        onIndexChange={setActiveIndex}
        bannerVisible={false}
        overlayRender={({ rotate, onRotate, scale, onScale, index, images, onClose }) => {
          return (
            <div className="absolute z-10 top-0 right-0 left-0 pl-2 pr-1 h-10 flex justify-between items-center bg-black bg-opacity-50">
              <span className="text-white font-din text-sm">
                {indexLabel}
                &emsp;
                {matchedEntryList[activeIndex].name}
              </span>
              <div className="flex items-center">
                <IconButton
                  icon={<SvgIcon.SubtractCircle size={18} />}
                  onClick={() => onScale(scale - 1)}
                />
                <IconButton
                  icon={<SvgIcon.AddCircle size={18} />}
                  onClick={() => onScale(scale + 1)}
                />
                <IconButton
                  icon={<SvgIcon.Restart size={18} />}
                  onClick={() => onRotate(rotate + 90)}
                />
                <IconButton
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
