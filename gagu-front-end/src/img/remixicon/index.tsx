import React from 'react'
import { ReactComponent as Save } from './save.svg'
import { ReactComponent as Copy } from './copy.svg'
import { ReactComponent as Restart } from './restart.svg'
import { ReactComponent as CodeSlash } from './code-slash.svg'
import { ReactComponent as Application } from './application.svg'
import { ReactComponent as Zip } from './zip.svg'
import { ReactComponent as Film } from './film.svg'
import { ReactComponent as Music } from './music.svg'
import { ReactComponent as Image } from './image.svg'
import { ReactComponent as Database } from './database.svg'
import { ReactComponent as Document } from './document.svg'
import { ReactComponent as PDF } from './pdf.svg'
import { ReactComponent as Folder } from './folder.svg'
import { ReactComponent as FolderFill } from './folder-fill.svg'
import { ReactComponent as FolderAdd } from './folder-add.svg'
import { ReactComponent as FolderInfo } from './folder-info.svg'
import { ReactComponent as File } from './file.svg'
import { ReactComponent as FileAdd } from './file-add.svg'
import { ReactComponent as Unknown } from './unknown.svg'
import { ReactComponent as Plant } from './plant.svg'
import { ReactComponent as Delete } from './delete.svg'
import { ReactComponent as Upload } from './upload.svg'
import { ReactComponent as Download } from './download.svg'
import { ReactComponent as ArrowUp } from './arrow-up.svg'
import { ReactComponent as ArrowDown } from './arrow-down.svg'
import { ReactComponent as ArrowLeft } from './arrow-left.svg'
import { ReactComponent as ArrowRight } from './arrow-right.svg'
import { ReactComponent as ChevronRight } from './chevron-right.svg'
import { ReactComponent as Apps } from './apps.svg'
import { ReactComponent as Edit } from './edit.svg'
import { ReactComponent as Refresh } from './refresh.svg'
import { ReactComponent as Check } from './check.svg'
import { ReactComponent as GitHub } from './github.svg'
import { ReactComponent as Close } from './close.svg'
import { ReactComponent as Subtract } from './subtract.svg'
import { ReactComponent as Fullscreen } from './fullscreen.svg'
import { ReactComponent as FullscreenExit } from './fullscreen-exit.svg'
import { ReactComponent as Share } from './share.svg'
import { ReactComponent as Star } from './star.svg'
import { ReactComponent as Eye } from './eye.svg'
import { ReactComponent as EyeOff } from './eye-off.svg'
import { ReactComponent as Filter } from './filter.svg'
import { ReactComponent as ViewList } from './view-list.svg'
import { ReactComponent as ViewGrid } from './view-grid.svg'
import { ReactComponent as ShutDown } from './shut-down.svg'
import { ReactComponent as Dashboard } from './dashboard.svg'
import { ReactComponent as FolderFillFiles } from './folder-fill-files.svg'
import { ReactComponent as FontSize } from './font-size.svg'
import { ReactComponent as Alipay } from './alipay.svg'
import { ReactComponent as Android } from './android.svg'
import { ReactComponent as QQ } from './qq.svg'
import { ReactComponent as Wechat } from './wechat.svg'
import { ReactComponent as Baidu } from './baidu.svg'
import { ReactComponent as Camera } from './camera.svg'
import { ReactComponent as FileText } from './file-text.svg'
import { ReactComponent as Walk } from './walk.svg'
import { ReactComponent as Computer } from './computer.svg'
import { ReactComponent as Account } from './account.svg'


const iconsMap: { [KEY: string]: React.FC } = {
  Save,
  Copy,
  Restart,
  CodeSlash,
  Application,
  Zip,
  Film,
  Music,
  Image,
  Database,
  Document,
  PDF,
  Folder,
  FolderFill,
  FolderAdd,
  FolderInfo,
  File,
  FileAdd,
  Unknown,
  Plant,
  Delete,
  Upload,
  Download,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Apps,
  Edit,
  Refresh,
  Check,
  GitHub,
  Subtract,
  Close,
  Fullscreen,
  FullscreenExit,
  Share,
  Star,
  Eye,
  EyeOff,
  Filter,
  ViewList,
  ViewGrid,
  ShutDown,
  Dashboard,
  FolderFillFiles,
  FontSize,
  Alipay,
  Android,
  QQ,
  Wechat,
  Baidu,
  Camera,
  FileText,
  Walk,
  Computer,
  Account,
}

const RemixIcon: { [KEY: string]: any } = {}

Object.entries(iconsMap).forEach(([name, icon]) => {
  RemixIcon[name] = (props: any) => {
    const { size } = props
    return (
      <span className="bp3-icon">
        {(icon as any).render({
          width: size || 16,
          height: size || 16,
        })}
      </span>
    )
  }
})

export default RemixIcon
