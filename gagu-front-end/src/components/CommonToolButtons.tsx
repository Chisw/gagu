import { Download16, Share16, Share32 } from '@carbon/icons-react'
import { useCallback, useState } from 'react'
import Confirmor, { ConfirmorProps } from './Confirmor'
import Toast from './EasyToast'
import ToolButton from './ToolButton'
import { copy, getDownloadInfo } from '../utils'
import { downloadEntries, getBinFileUrl } from '../utils/api'
import { IOpenedEntry } from '../utils/types'

interface CommonToolButtonsProps {
  currentEntry: IOpenedEntry | null
}


export default function CommonToolButtons(props: CommonToolButtonsProps) {

  const { currentEntry } = props

  const [shareConfirmorProps, setShareConfirmorProps] = useState<ConfirmorProps>({ isOpen: false })

  const handleShare = useCallback(() => {
    const url = getBinFileUrl(`${currentEntry!.parentPath}/${currentEntry!.name}`)
    const close = () => setShareConfirmorProps({ isOpen: false })

    setShareConfirmorProps({
      isOpen: true,
      content: (
        <div className="p-4 text-center">
          <div className="p-4 flex justify-center">
            <Share32 />
          </div>
          <p className="mt-2 text-sm break-all">分享文件链接给局域网内的伙伴</p>
          <p className="mt-1 text-xs text-gray-400 break-all">{url}</p>
        </div>
      ),
      confirmText: '复制链接',
      onCancel: close,
      onConfirm: () => {
        close()
        copy(url)
        Toast.toast('复制成功', 1000)
      },
    })
  }, [currentEntry])

  const handleDownload = useCallback(() => {
    if (currentEntry) {
      const { downloadName, cmd } = getDownloadInfo(currentEntry.parentPath, [currentEntry])
      downloadEntries(currentEntry.parentPath, downloadName, cmd)
    }
  }, [currentEntry])

  return (
    <>
      <div className="flex-grow" />
      <ToolButton
        title={`分享 ${currentEntry?.name}`}
        icon={<Share16 />}
        onClick={handleShare}
        disabled={!currentEntry}
      />
      <ToolButton
        title={`下载 ${currentEntry?.name}`}
        icon={<Download16 />}
        onClick={handleDownload}
        disabled={!currentEntry}
      />

      <Confirmor {...shareConfirmorProps} />
    </>
  )
}