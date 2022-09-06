import { PhotoSlider } from 'react-photo-view'
import { FsApi } from '../../api'
import { SvgIcon } from '../../components/base'
import { IconButton } from '../../components/base/IconButton'
import { IEntry } from '../../types'

interface ViewerProps {
  activeIndex: number
  setActiveIndex: (index: number) => void
  matchedEntryList: IEntry[]
  viewerShow: boolean
  setViewerShow: (is: boolean) => void
}

export default function Viewer(props: ViewerProps) {

  const {
    activeIndex,
    setActiveIndex,
    matchedEntryList,
    viewerShow,
    setViewerShow,
  } = props

  return (
    <>
      <PhotoSlider
        images={matchedEntryList.map(entry => ({ src: FsApi.getFileStreamUrl(entry), key: entry.name }))}
        visible={viewerShow}
        onClose={() => setViewerShow(false)}
        index={activeIndex}
        onIndexChange={setActiveIndex}
        bannerVisible={false}
        overlayRender={({ rotate, onRotate, scale, onScale, index, images, onClose }) => {
          return (
            <div className="absolute z-10 top-0 right-0 left-0 h-10 flex items-center bg-black-500">
              <span className="text-white font-din text-xs">{index + 1} / {images.length} {matchedEntryList[index].name}</span>
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
          )
        }}
      />
    </>
  )
}
