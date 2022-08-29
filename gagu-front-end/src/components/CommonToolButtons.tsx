import { useCallback, useState } from 'react'
import Confirmor, { ConfirmorProps } from './Confirmor'
import toast from 'react-hot-toast'
import ToolButton from './ToolButton'
import { copy, getDownloadInfo } from '../utils'
import { FsApi } from '../api'
import { IEntry } from '../types'
import { SvgIcon } from '../components/base'

interface CommonToolButtonsProps {
  activeEntry: IEntry | null
}

export default function CommonToolButtons(props: CommonToolButtonsProps) {

  const { activeEntry } = props

  const [shareConfirmorProps, setShareConfirmorProps] = useState<ConfirmorProps>({ isOpen: false })

  const handleShare = useCallback(() => {
    const url = FsApi.getFileStreamUrl(activeEntry!)
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
  }, [activeEntry])

  const handleDownload = useCallback(() => {
    if (activeEntry) {
      const { downloadName, cmd } = getDownloadInfo(activeEntry.parentPath, [activeEntry])
      FsApi.startDownload(activeEntry.parentPath, downloadName, cmd)
    }
  }, [activeEntry])

  return (
    <>
      <div className="flex-grow" />
      <ToolButton
        title={`分享 ${activeEntry?.name}`}
        icon={<SvgIcon.Share />}
        onClick={handleShare}
        disabled={!activeEntry}
      />
      <ToolButton
        title={`下载 ${activeEntry?.name}`}
        icon={<SvgIcon.Download />}
        onClick={handleDownload}
        disabled={!activeEntry}
      />

      <Confirmor {...shareConfirmorProps} />
    </>
  )
}
