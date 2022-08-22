import { useCallback, useState } from 'react'
import Confirmor, { ConfirmorProps } from './Confirmor'
import toast from 'react-hot-toast'
import ToolButton from './ToolButton'
import { copy, getDownloadInfo } from '../utils'
import { FsApi } from '../api'
import { IOpenedEntry } from '../utils/types'
import { SvgIcon } from '../components/base'

interface CommonToolButtonsProps {
  currentEntry: IOpenedEntry | null
}

export default function CommonToolButtons(props: CommonToolButtonsProps) {

  const { currentEntry } = props

  const [shareConfirmorProps, setShareConfirmorProps] = useState<ConfirmorProps>({ isOpen: false })

  const handleShare = useCallback(() => {
    const url = FsApi.getFileStreamUrl(`${currentEntry!.parentPath}/${currentEntry!.name}`)
    const close = () => setShareConfirmorProps({ isOpen: false })
    const icon = <SvgIcon.Share size={36} />

    setShareConfirmorProps({
      isOpen: true,
      content: (
        <div className="p-4 text-center">
          <div className="p-4 flex justify-center">
            {icon}
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
        toast.success('复制成功')
      },
    })
  }, [currentEntry])

  const handleDownload = useCallback(() => {
    if (currentEntry) {
      const { downloadName, cmd } = getDownloadInfo(currentEntry.parentPath, [currentEntry])
      FsApi.startDownload(currentEntry.parentPath, downloadName, cmd)
    }
  }, [currentEntry])

  return (
    <>
      <div className="flex-grow" />
      <ToolButton
        title={`分享 ${currentEntry?.name}`}
        icon={<SvgIcon.Share />}
        onClick={handleShare}
        disabled={!currentEntry}
      />
      <ToolButton
        title={`下载 ${currentEntry?.name}`}
        icon={<SvgIcon.Download />}
        onClick={handleDownload}
        disabled={!currentEntry}
      />

      <Confirmor {...shareConfirmorProps} />
    </>
  )
}
